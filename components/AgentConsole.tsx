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
  const [token, setToken] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const busy = useRef(false);
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

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript]);

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
  };
  endRef.current = end;

  const ctaLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "live"
        ? "End call"
        : "Try an agent";

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

      {/* live transcript */}
      {transcript.length > 0 && (
        <div
          ref={logRef}
          className="mt-4 flex max-h-52 flex-col gap-3 overflow-y-auto border border-line bg-surface-2 p-5"
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
        </div>
      )}

      {/* times the agent just offered. Tapping one sends it back as a chat turn
          so the agent drives the booking exactly as it would by voice. */}
      {slots.length > 0 && !booking && (
        <div className="mt-4 border border-line bg-surface-2 p-5">
          <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
            PICK A TIME
          </span>
          <div className="flex flex-wrap gap-2.5 pt-3.5">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => {
                  // optimistic: the agent confirms in the transcript
                  slotsStore.clear();
                  sendRef.current?.(`I'll take ${slot.label}.`);
                }}
                className="rounded-full border border-line-3 px-4 py-2.5 font-mono text-xs text-cream transition-colors hover:border-green hover:text-green"
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* a call the agent booked. Outlives the call itself: the visitor gets no
          confirmation email, so this is their only record until Naman replies. */}
      {booking && (
        <div className="mt-4 border border-green/40 bg-surface-2 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-green">
              ● CALL BOOKED
            </span>
            <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
              {booking.minutes} MIN
            </span>
          </div>
          <p className="pt-3 text-[17px] font-semibold leading-snug text-cream">
            {booking.label}
          </p>
          {booking.email && (
            <p className="pt-1 font-mono text-[12px] text-muted">
              confirmation to {booking.email}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2.5 pt-4">
            <button
              onClick={() => downloadIcs(booking, config.email)}
              className="rounded-full bg-green px-4 py-2.5 font-mono text-xs font-bold text-green-deep transition-opacity hover:opacity-90"
            >
              Add to calendar
            </button>
            <button
              onClick={() => bookingStore.clear()}
              className="rounded-full border border-line-3 px-4 py-2.5 font-mono text-xs text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
            >
              Dismiss
            </button>
          </div>
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
            onClick={() => start()}
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

      {token && (
        <div className="hidden">
          <CallEngine token={token} onEnd={end} />
        </div>
      )}
    </div>
  );
}
