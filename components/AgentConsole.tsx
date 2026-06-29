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
