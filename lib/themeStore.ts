// two skins: daylight (orange on paper, default) and phosphor (green on void)
export type Theme = "dark" | "light";

let theme: Theme = "light";
const subs = new Set<() => void>();

function setFavicon(next: Theme) {
  const href = next === "light" ? "/icon-daylight.svg" : "/icon-phosphor.svg";
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
  if (links.length === 0) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = href;
    document.head.appendChild(link);
    return;
  }
  links.forEach((l) => {
    l.type = "image/svg+xml";
    l.href = href;
  });
}

function apply(next: Theme) {
  if (next === "dark") {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }
  setFavicon(next);
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
    const next: Theme = attr === "dark" ? "dark" : "light";
    setFavicon(next);
    if (next !== theme) {
      theme = next;
      subs.forEach((cb) => cb());
    }
  },
};
