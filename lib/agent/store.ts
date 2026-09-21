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

// a call the agent booked mid-conversation, pushed over the `booking.confirmed`
// text-stream topic. Rendered as a card so the visitor leaves with a record —
// the agent can't email them (service accounts can't invite attendees on a
// consumer gmail), so this plus the .ics is their confirmation.
export type Booking = {
  start: string; // ISO 8601, UTC
  label: string; // already phrased in the visitor's timezone by the agent
  minutes: number;
  email: string | null;
  tz: string;
};

let booking: Booking | null = null;
const bSubs = new Set<() => void>();

export const bookingStore = {
  get: (): Booking | null => booking,
  set: (next: Booking | null) => {
    booking = next;
    bSubs.forEach((cb) => cb());
  },
  clear: () => {
    if (booking === null) return;
    booking = null;
    bSubs.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    bSubs.add(cb);
    return () => {
      bSubs.delete(cb);
    };
  },
};

// chat send fn, set by a component mounted inside the LiveKit room context
export const sendRef: { current: ((text: string) => void) | null } = {
  current: null,
};
