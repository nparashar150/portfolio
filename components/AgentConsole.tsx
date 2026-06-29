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
