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
  get: (): TranscriptLine[] => transcript,
  set: (lines: TranscriptLine[]) => {
    transcript = lines;
    tSubs.forEach((cb) => cb());
  },
  clear: () => {
    if (transcript.length === 0) return;
    transcript = EMPTY_TRANSCRIPT;
    tSubs.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    tSubs.add(cb);
    return () => {
      tSubs.delete(cb);
    };
  },
};

// chat send fn, set by a component mounted inside the LiveKit room context
export const sendRef: { current: ((text: string) => void) | null } = {
  current: null,
};
