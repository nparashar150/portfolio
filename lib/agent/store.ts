export const LIVEKIT_URL = "wss://naman-s-project-jmq6m83m.livekit.cloud";

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

// slots the agent just offered, pushed over `slots.offered`. Reading six times
// aloud is unusable, so the UI renders them as chips the visitor can tap; the
// tap is sent back as a chat turn, keeping the conversation the source of truth.
export type Slot = { id: string; label: string };

let slots: Slot[] = [];
const sSubs = new Set<() => void>();

export const EMPTY_SLOTS: Slot[] = [];

export const slotsStore = {
  get: (): Slot[] => slots,
  set: (next: Slot[]) => {
    slots = next.length === 0 ? EMPTY_SLOTS : next;
    sSubs.forEach((cb) => cb());
  },
  clear: () => {
    if (slots.length === 0) return;
    slots = EMPTY_SLOTS;
    sSubs.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    sSubs.add(cb);
    return () => {
      sSubs.delete(cb);
    };
  },
};

// a structured input the agent asked the browser for over RPC. Typing an email
// beats spelling it aloud — the STT mangles addresses, and "at gmail dot com"
// costs a whole conversational turn to confirm. The agent falls back to voice
// if nothing answers, so telephony and headless clients still work.
export type UiRequest = {
  id: string;
  kind: "email";
  prompt: string;
};

let uiRequest: UiRequest | null = null;
let pending: { resolve: (v: string) => void; reject: (e: Error) => void } | null =
  null;
const uSubs = new Set<() => void>();

function notify() {
  uSubs.forEach((cb) => cb());
}

export const uiRequestStore = {
  get: (): UiRequest | null => uiRequest,
  subscribe: (cb: () => void) => {
    uSubs.add(cb);
    return () => {
      uSubs.delete(cb);
    };
  },

  /** Show the input and resolve when the visitor submits. */
  open: (req: UiRequest): Promise<string> => {
    // A second request supersedes the first; never leave a promise dangling.
    pending?.reject(new Error("superseded"));
    uiRequest = req;
    notify();
    return new Promise<string>((resolve, reject) => {
      pending = { resolve, reject };
    });
  },

  submit: (value: string) => {
    const p = pending;
    uiRequest = null;
    pending = null;
    notify();
    p?.resolve(value);
  },

  /** Visitor dismissed it, or the call ended — the agent falls back to voice. */
  cancel: () => {
    const p = pending;
    uiRequest = null;
    pending = null;
    notify();
    p?.reject(new Error("cancelled"));
  },
};

// chat send fn, set by a component mounted inside the LiveKit room context
export const sendRef: { current: ((text: string) => void) | null } = {
  current: null,
};
