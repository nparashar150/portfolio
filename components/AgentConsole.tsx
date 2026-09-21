"use client";

import { config } from "@/lib/config";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  agentStatus,
  type AgentStatus,
  bookingStore,
  EMPTY_SLOTS,
  EMPTY_TRANSCRIPT,
  sendRef,
  slotsStore,
  transcriptStore,
  uiRequestStore,
} from "@/lib/agent/store";
import { downloadIcs } from "@/lib/agent/ics";
import { Visualizer } from "./agent/Visualizer";
import { AGENT_START_EVENT, AGENT_END_EVENT } from "@/lib/gateStore";

// LiveKit is heavy (~hundreds of KB) and only needed once a call starts, so it
// stays out of the initial bundle and loads on demand.
const CallEngine = dynamic(
  () => import("./agent/CallEngine").then((m) => m.CallEngine),
  { ssr: false },
);

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AgentConsole() {
  const status = useSyncExternalStore(
    agentStatus.subscribe,
    agentStatus.get,
    () => "idle" as AgentStatus,
  );
  const transcript = useSyncExternalStore(
    transcriptStore.subscribe,
    transcriptStore.get,
    () => EMPTY_TRANSCRIPT,
  );
  const booking = useSyncExternalStore(
    bookingStore.subscribe,
    bookingStore.get,
    () => null,
  );
  const slots = useSyncExternalStore(
    slotsStore.subscribe,
    slotsStore.get,
    () => EMPTY_SLOTS,
  );
  const uiRequest = useSyncExternalStore(
    uiRequestStore.subscribe,
    uiRequestStore.get,
    () => null,
  );
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [token, setToken] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const busy = useRef(false);
  // Plays the moment they click, to cover the gap before the agent's first
  // word — mic prompt, token, connect, then a worker cold start on the free
  // tier. Browsers allow it because a click preceded it. Optional: if the file
  // isn't there, play() rejects and we carry on in silence.
  const intro = useRef<HTMLAudioElement | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<(() => void) | null>(null);
  const endRef = useRef<(() => void) | null>(null);

  const active = status === "connecting" || status === "live";

  useEffect(() => {
    if (status !== "live") {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Stop the clip the instant the real agent has something to say.
  useEffect(() => {
    if (status === "live" || status === "error" || status === "idle") {
      intro.current?.pause();
      intro.current = null;
    }
  }, [status]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    // affordances render inside the same scroller, so they move the bottom too
  }, [transcript, slots, uiRequest, booking]);

  // boot gate's "enter with voice" and the talk dock drive the call remotely
  useEffect(() => {
    const onStart = () => startRef.current?.();
    const onEnd = () => endRef.current?.();
    window.addEventListener(AGENT_START_EVENT, onStart);
    window.addEventListener(AGENT_END_EVENT, onEnd);
    return () => {
      window.removeEventListener(AGENT_START_EVENT, onStart);
      window.removeEventListener(AGENT_END_EVENT, onEnd);
    };
  }, []);

  const start = async () => {
    if (busy.current || active) return;
    busy.current = true;
    agentStatus.set("connecting");
    transcriptStore.clear();
    bookingStore.clear();
    slotsStore.clear();

    try {
      const clip = new Audio("/agent-intro.mp3");
      clip.volume = 0.85;
      intro.current = clip;
      void clip.play().catch(() => {
        intro.current = null;
      });
    } catch {
      intro.current = null;
    }

    // tie mic permission to the user gesture (before any async work)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      agentStatus.set("error");
      setTimeout(() => agentStatus.set("idle"), 2600);
      busy.current = false;
      return;
    }

    try {
      // The browser is the only thing that knows the visitor's timezone, and
      // the agent needs it to offer slots in their local time.
      const res = await fetch("/api/webcall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.user_token) throw new Error("token");
      setToken(data.user_token);
    } catch {
      agentStatus.set("error");
      setTimeout(() => agentStatus.set("idle"), 2600);
    } finally {
      busy.current = false;
    }
  };

  startRef.current = start;

  const end = () => {
    setToken(null);
    agentStatus.set("idle");
    transcriptStore.clear();
    slotsStore.clear();
    uiRequestStore.cancel();
  };
  endRef.current = end;

  const ctaLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "live"
        ? "End call"
        : "Talk — and book 30 min";

  return (
    <div id="console" className="w-full">
      {/* contribution grid ⇄ live waveform */}
      <div className="border border-line bg-surface-2 p-4 md:p-6">
        <Visualizer live={status === "live"} />
        <div className="flex items-center justify-between pt-4">
          <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
            {status === "live"
              ? "REAL-TIME WAVEFORM"
              : "GITHUB CONTRIBUTIONS · LAST YEAR"}
          </span>
          <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
            {status === "live" ? (
              <span className="text-green">● LIVE · {fmt(seconds)}</span>
            ) : (
              "REAL-TIME VOICE"
            )}
          </span>
        </div>
      </div>

      {/* One panel for the whole exchange. Slots, the details form and the
          confirmation all render inline, in the agent's column, so they read as
          turns in the conversation rather than widgets stacked underneath it. */}
      {(transcript.length > 0 || slots.length > 0 || uiRequest || booking) && (
        <div
          ref={logRef}
          className="mt-4 flex max-h-[26rem] flex-col gap-3 overflow-y-auto border border-line bg-surface-2 p-5"
        >
          {transcript.map((line) => (
            <div key={line.id} className="flex gap-3">
              <span
                className={`mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] ${
                  line.role === "agent" ? "text-green" : "text-muted"
                }`}
              >
                {line.role === "agent" ? "NAMAN.AI" : "YOU"}
              </span>
              <p className="text-[14px] leading-relaxed text-cream">
                {line.text}
              </p>
            </div>
          ))}

          {/* times the agent just offered — tapping one is a turn in the chat */}
          {slots.length > 0 && !booking && !uiRequest && (
            <div className="flex gap-3">
              <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
                PICK ONE
              </span>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      slotsStore.clear();
                      sendRef.current?.(`I'll take ${slot.label}.`);
                    }}
                    className="rounded-full border border-line-3 px-3.5 py-2 font-mono text-[11px] text-cream transition-colors hover:border-green hover:text-green"
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* the agent asked for details. Typed beats dictated: STT mangles both
              names and addresses, and confirming either aloud costs a turn. */}
          {uiRequest && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = draft.name.trim();
                const email = draft.email.trim();
                if (!email) return;
                setDraft({ name: "", email: "" });
                transcriptStore.addTyped(`${name || "I"} — ${email}`);
                uiRequestStore.submit({ name, email });
              }}
              className="flex gap-3"
            >
              <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
                DETAILS
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <input
                  aria-label="Your name"
                  autoFocus
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Your name"
                  autoComplete="name"
                  className="border border-line-3 bg-surface px-3.5 py-2 font-mono text-[13px] text-cream outline-none placeholder:text-faint focus:border-green"
                />
                <input
                  aria-label="Your email"
                  type="email"
                  required
                  value={draft.email}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="border border-line-3 bg-surface px-3.5 py-2 font-mono text-[13px] text-cream outline-none placeholder:text-faint focus:border-green"
                />
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="submit"
                    className="rounded-full bg-green px-4 py-2 font-mono text-[11px] font-bold text-green-deep transition-opacity hover:opacity-90"
                  >
                    Confirm booking
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({ name: "", email: "" });
                      uiRequestStore.cancel();
                    }}
                    className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
                  >
                    I&apos;ll say it
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* the booked call. Outlives the call itself — the visitor gets no
              confirmation email, so this is their only record. */}
          {booking && (
            <div className="flex gap-3">
              <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
                BOOKED
              </span>
              <div className="min-w-0 flex-1 border border-green/40 p-4">
                <p className="text-[15px] font-semibold leading-snug text-cream">
                  {booking.label}
                </p>
                <p className="pt-1 font-mono text-[11px] text-muted">
                  {booking.minutes} min
                  {booking.email ? ` · ${booking.email}` : ""}
                  {booking.invited ? " · invite sent" : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  {booking.joinUrl && (
                    <a
                      href={booking.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-green px-4 py-2 font-mono text-[11px] font-bold text-green-deep transition-opacity hover:opacity-90"
                    >
                      Join link ↗
                    </a>
                  )}
                  {!booking.invited && (
                  <button
                    onClick={() => downloadIcs(booking, config.email)}
                    className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-cream transition-colors hover:border-green hover:text-green"
                  >
                    Add to calendar
                  </button>
                  )}
                  <button
                    onClick={() => bookingStore.clear()}
                    className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* try an agent + quick prompts */}
      <div className="flex flex-wrap items-center gap-2.5 pt-5">
        <button
          onClick={() => (active ? end() : start())}
          disabled={status === "connecting"}
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-line-3 bg-surface py-2 pr-5 pl-2 transition-colors hover:border-green/60 disabled:opacity-70"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-green-deep">
            <span className="text-[11px]">{active ? "■" : "▶"}</span>
          </span>
          <span className="text-[14px] font-semibold text-cream">
            {ctaLabel}
          </span>
        </button>
        {config.agentPrompts.map((p, idx) => (
          <button
            key={p}
            // Mid-call these read as "ask this" — so ask it. Before a call they
            // start one; the agent opens with its greeting either way.
            onClick={() => (status === "live" ? sendRef.current?.(p) : start())}
            className={
              idx === config.agentPrompts.length - 1
                ? "rounded-full bg-green px-4 py-2.5 font-mono text-xs font-bold text-green-deep transition-opacity hover:opacity-90"
                : "rounded-full border border-line-3 px-4 py-2.5 font-mono text-xs text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
            }
          >
            {p}
          </button>
        ))}
      </div>

      {!active && (
        <p className="pt-3 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-faint">
          No form. No email thread. It reads my actual calendar and books you in.
        </p>
      )}

      {token && (
        <div className="hidden">
          <CallEngine token={token} onEnd={end} />
        </div>
      )}
    </div>
  );
}
