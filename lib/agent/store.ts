export const LIVEKIT_URL = "wss://ringg-ai-prod-r0vhjzhs.livekit.cloud";

// the live agent's per-band audio volumes, written by the call engine, read by the visualizer's rAF loop
export const bandsRef: { current: number[] } = { current: [] };

export type AgentStatus = "idle" | "connecting" | "live" | "error";

let status: AgentStatus = "idle";
const subscribers = new Set<() => void>();

export const agentStatus = {
  get: (): AgentStatus => status,
  set: (next: AgentStatus) => {
    if (next === status) return;
    status = next;
    subscribers.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  },
};

export type TranscriptLine = { id: string; role: "you" | "agent"; text: string };

export const EMPTY_TRANSCRIPT: TranscriptLine[] = [];

let transcript: TranscriptLine[] = EMPTY_TRANSCRIPT;
const tSubs = new Set<() => void>();

export const transcriptStore = {
