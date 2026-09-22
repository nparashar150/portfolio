"use client";

import { config } from "@/lib/config";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  agentStatus,
  type AgentStatus,
  bookingStore,
  consoleInViewStore,
  slotsStore,
  transcriptStore,
  uiRequestStore,
} from "@/lib/agent/store";
import { micRef, micStore, sendRef } from "@/lib/agent/store";
import { Conversation } from "./agent/Conversation";
import { HangUpIcon, MicIcon, PlayIcon } from "./agent/CallIcons";
import { trackCallStarted } from "@/lib/analytics";
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
  const micOn = useSyncExternalStore(micStore.subscribe, micStore.get, () => true);
  const [token, setToken] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const busy = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  // Plays the moment they click, to cover the gap before the agent's first
  // word — mic prompt, token, connect, then a worker cold start on the free
  // tier. Browsers allow it because a click preceded it. Optional: if the file
  // isn't there, play() rejects and we carry on in silence.
  const intro = useRef<HTMLAudioElement | null>(null);
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

  // Hand the conversation between the dock and this console as it scrolls.
  // A generous negative margin means the swap happens while the console is
  // comfortably on screen, not the instant one pixel of it appears.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        consoleInViewStore.set(entry.isIntersecting);
      },
      { rootMargin: "-15% 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      consoleInViewStore.set(false);
    };
  }, []);

  // Stop the clip the instant the real agent has something to say.
  useEffect(() => {
    if (status === "live" || status === "error" || status === "idle") {
      intro.current?.pause();
      intro.current = null;
    }
  }, [status]);

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
      // Only now: the mic was granted and a session really exists. Firing on
      // the click would count people who dismissed the permission prompt.
      trackCallStarted();
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
        ? micOn
          ? "Mute"
          : "Unmute"
        : "Talk — and book 30 min";

  return (
    <div id="console" ref={rootRef} className="w-full">
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

      {/* The conversation lives here only while this console is on screen;
          otherwise the floating dock holds it. See Conversation. */}
      {inView && <Conversation />}

      {/* try an agent + quick prompts */}
      <div className="flex flex-wrap items-center gap-2.5 pt-5">
        <button
          onClick={() => (status === "live" ? micRef.current?.(!micOn) : start())}
          disabled={status === "connecting"}
          aria-label={
            status === "live"
              ? micOn
                ? "Mute your microphone"
                : "Unmute your microphone"
              : "Talk to the agent"
          }
          aria-pressed={status === "live" ? !micOn : undefined}
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-line-3 bg-surface py-2 pr-5 pl-2 transition-colors hover:border-green/60 disabled:opacity-70"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              status === "live" && !micOn
                ? "bg-line-3 text-cream"
                : "bg-green text-green-deep"
            }`}
          >
            {status === "live" ? <MicIcon muted={!micOn} /> : <PlayIcon />}
          </span>
          <span className="text-[14px] font-semibold text-cream">{ctaLabel}</span>
        </button>
        {active && (
          <button
            onClick={end}
            aria-label="End call"
            className="flex shrink-0 items-center gap-2 rounded-full bg-danger px-4 py-2.5 font-mono text-xs font-bold tracking-[0.06em] text-white transition-opacity hover:opacity-90"
          >
            <HangUpIcon />
            END CALL
          </button>
        )}
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
