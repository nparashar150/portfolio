// two skins: phosphor (green on void) and daylight (orange on paper)
export type Theme = "dark" | "light";

let theme: Theme = "dark";
const subs = new Set<() => void>();

function apply(next: Theme) {
  if (next === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

export const themeStore = {
  get: (): Theme => theme,
  subscribe(cb: () => void) {
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },
  set(next: Theme) {
    if (next === theme) return;
    theme = next;
    apply(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    subs.forEach((cb) => cb());
  },
  // sync the store with what the no-flash script already put on <html>
  init() {
    const attr = document.documentElement.dataset.theme;
    const next: Theme = attr === "light" ? "light" : "dark";
    if (next !== theme) {
      theme = next;
      subs.forEach((cb) => cb());
    }
  },
};
