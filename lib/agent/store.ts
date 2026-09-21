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

export type TranscriptLine = {
  id: string;
  role: "you" | "agent";
  text: string;
  /** ms epoch, used only to interleave typed turns with spoken ones */
  at?: number;
};

export const EMPTY_TRANSCRIPT: TranscriptLine[] = [];

// Speech arrives as a full list from LiveKit on every update, while typed turns
// (a tapped slot, a submitted email) are local and would be wiped by the next
// speech update. So they're kept apart and merged by timestamp on read.
let spoken: TranscriptLine[] = [];
let typed: TranscriptLine[] = [];
let merged: TranscriptLine[] = EMPTY_TRANSCRIPT;
const firstSeen = new Map<string, number>();
const tSubs = new Set<() => void>();

function recompute() {
  const all = [...spoken, ...typed];
  merged =
    all.length === 0
      ? EMPTY_TRANSCRIPT
      : all.sort((a, b) => (a.at ?? 0) - (b.at ?? 0));
  tSubs.forEach((cb) => cb());
}

export const transcriptStore = {
  get: (): TranscriptLine[] => merged,

  /** Full replacement from LiveKit's transcription stream. */
  set: (lines: TranscriptLine[]) => {
    const now = Date.now();
    spoken = lines.map((l) => {
      // Pin each line to when it first appeared, so later edits to an
      // in-progress line don't jump it ahead of a typed turn.
      if (!firstSeen.has(l.id)) firstSeen.set(l.id, now);
      return { ...l, at: firstSeen.get(l.id) };
    });
    recompute();
  },

  /** A turn the visitor sent by tapping or typing rather than speaking. */
  addTyped: (text: string) => {
    typed = [
      ...typed,
      { id: `typed-${Date.now()}`, role: "you", text, at: Date.now() },
    ];
    recompute();
  },

  clear: () => {
    if (merged.length === 0) return;
    spoken = [];
    typed = [];
    firstSeen.clear();
    merged = EMPTY_TRANSCRIPT;
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
  /** Where to actually join. Without this a booking is just a promise. */
  joinUrl: string | null;
  /** Google emailed a real invite, so the .ics fallback isn't needed. */
  invited: boolean;
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
  kind: "details";
  prompt: string;
};

/** What the form hands back. */
export type Details = { name: string; email: string };

let uiRequest: UiRequest | null = null;
let pending: {
  resolve: (v: Details) => void;
  reject: (e: Error) => void;
} | null = null;
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
  open: (req: UiRequest): Promise<Details> => {
    // A second request supersedes the first; never leave a promise dangling.
    pending?.reject(new Error("superseded"));
    uiRequest = req;
    notify();
    return new Promise<Details>((resolve, reject) => {
      pending = { resolve, reject };
    });
  },

  submit: (value: Details) => {
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

// Whether the in-page console is on screen. The conversation panel lives in the
// floating dock while it isn't, and hands off to the console when it is — one
// panel, two homes, so scrolling never produces two copies of the same thread.
let consoleInView = false;
const vSubs = new Set<() => void>();

export const consoleInViewStore = {
  get: (): boolean => consoleInView,
  set: (next: boolean) => {
    if (next === consoleInView) return;
    consoleInView = next;
    vSubs.forEach((cb) => cb());
  },
  subscribe: (cb: () => void) => {
    vSubs.add(cb);
    return () => {
      vSubs.delete(cb);
    };
  },
};

// chat send fn, set by a component mounted inside the LiveKit room context
export const sendRef: { current: ((text: string) => void) | null } = {
  current: null,
};
