"use client";

import { config } from "@/lib/config";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  agentStatus,
  type AgentStatus,
  EMPTY_TRANSCRIPT,
  sendRef,
  transcriptStore,
} from "@/lib/agent/store";
import { Visualizer } from "./agent/Visualizer";
import { CallEngine } from "./agent/CallEngine";

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const COPY: Record<AgentStatus, string> = {
  idle: "By day I ship commits. Hit play and they turn into a live voice agent you can actually talk to.",
  connecting: "Connecting you to the agent, allow your mic…",
  live: "You're live. Say hi out loud, or type, ask me anything.",
  error: "Couldn't connect right now. Give it another go in a moment.",
};

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
  const [token, setToken] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [seconds, setSeconds] = useState(0);
  const busy = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  const active = status === "connecting" || status === "live";

  useEffect(() => {
    if (status !== "live") {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // keep the transcript scrolled to the latest line
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript]);

  const start = useCallback(async () => {
    if (busy.current || active) return;
    busy.current = true;
    agentStatus.set("connecting");
    transcriptStore.clear();

    // tie the mic permission to the user gesture (before any async work)
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
      const res = await fetch("/api/webcall", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.user_token) throw new Error("token");
      setToken(data.user_token);
    } catch {
      agentStatus.set("error");
      setTimeout(() => agentStatus.set("idle"), 2600);
    } finally {
      busy.current = false;
    }
  }, [active]);

  const end = useCallback(() => {
    setToken(null);
    agentStatus.set("idle");
    transcriptStore.clear();
  }, []);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (status === "live" && sendRef.current) {
      sendRef.current(text); // chat mid-voice-call
    } else {
      void start();
    }
  };

  const ctaLabel =
    status === "connecting"
      ? "Connecting…"
      : status === "live"
        ? "End call"
        : "Try an agent";

  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 md:px-10 lg:px-16">
      <div className="border-y border-line py-10 md:py-14">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2 w-2 rounded-full bg-green ${active ? "animate-pulse" : ""}`}
            />
            <span className="font-mono text-xs font-bold tracking-[0.06em] text-cream">
              NAMAN.AI
            </span>
            <span className="hidden font-mono text-xs tracking-[0.06em] text-muted sm:block">
              {status === "live" ? "/ LIVE · VOICE + CHAT" : "/ COMMITS → VOICE AGENT"}
            </span>
          </div>
          <span className="font-mono text-xs tracking-[0.06em] text-muted">
            {status === "live" ? `● LIVE · ${fmt(seconds)}` : "IDLE · TAP TO TALK"}
          </span>
        </div>

        {/* status line */}
        <div className="flex items-center gap-3 pt-5 pb-6">
          <span className="shrink-0 font-mono text-[13px] font-bold text-green">
            AI ›
          </span>
          <p className="text-[15px] text-cream md:text-base">{COPY[status]}</p>
        </div>

        {/* the grid: commit graph ⇄ live waveform */}
        <div className="rounded-xl border border-line bg-surface-2 p-4 md:p-6">
          <Visualizer live={status === "live"} />
          <div className="flex items-center justify-between pt-3.5">
            <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
              {status === "live"
                ? "WAVEFORM · LIVE"
                : "GITHUB CONTRIBUTIONS · LAST YEAR"}
            </span>
            <span className="font-mono text-[11px] tracking-[0.06em] text-faint">
              powered by RinggAI
            </span>
          </div>
        </div>

        {/* live transcript */}
        {transcript.length > 0 && (
          <div
            ref={logRef}
            className="mt-5 flex max-h-52 flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface-2 p-5"
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

        {/* controls */}
        <div className="flex flex-col gap-3.5 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => (active ? end() : start())}
              disabled={status === "connecting"}
              className="flex shrink-0 items-center gap-3 rounded-full border border-line-3 bg-[#141414] py-2.5 pr-6 pl-2.5 transition-colors hover:border-green/60 disabled:opacity-70"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green text-green-deep">
                <span className="text-[11px]">{active ? "■" : "▶"}</span>
              </span>
              <span className="text-[15px] font-semibold text-cream">
                {ctaLabel}
              </span>
            </button>
            <div className="flex flex-1 items-center justify-between rounded-full border border-line-2 bg-surface py-2 pr-2.5 pl-5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={
                  status === "live"
                    ? "Type a message to the agent…"
                    : "… or type to start a chat"
                }
                className="w-full bg-transparent text-[15px] text-cream outline-none placeholder:text-faint"
              />
              <button
                onClick={submit}
                className="flex shrink-0 items-center gap-2 rounded-full bg-line px-3.5 py-2 transition-colors hover:bg-line-3"
              >
                <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-muted-2">
                  SEND
                </span>
                <span className="text-sm text-green">→</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="pr-1 font-mono text-[11px] tracking-[0.06em] text-faint">
              TRY:
            </span>
            {config.agentPrompts.map((p, idx) => (
              <button
                key={p}
                onClick={() => (status === "live" ? sendRef.current?.(p) : start())}
                className={
                  idx === config.agentPrompts.length - 1
                    ? "rounded-full bg-green px-3.5 py-1.5 font-mono text-xs font-bold text-green-deep transition-opacity hover:opacity-90"
                    : "rounded-full border border-line-3 px-3.5 py-1.5 font-mono text-xs text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {token && (
        <div className="hidden">
          <CallEngine token={token} onEnd={end} />
        </div>
      )}
    </section>
  );
}
