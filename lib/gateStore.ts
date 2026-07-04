// tiny external store: the boot gate flips this once, the hero listens
type Listener = () => void;

let done = false;
const listeners = new Set<Listener>();

export const gateStore = {
  get: () => done,
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  finish() {
    if (done) return;
    done = true;
    listeners.forEach((l) => l());
  },
};

export const AGENT_START_EVENT = "naman:agent-start";
