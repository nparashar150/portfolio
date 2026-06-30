// shared signal: the loader fires this when it finishes so the hero can animate in
let done = false;
const subs = new Set<() => void>();

export const loaderState = {
  isDone: () => done,
  markDone: () => {
    if (done) return;
    done = true;
    subs.forEach((cb) => cb());
  },
  onDone: (cb: () => void) => {
    if (done) {
      cb();
      return () => {};
    }
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },
};
