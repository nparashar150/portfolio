"use client";

import { useState, useSyncExternalStore } from "react";
import { preview, type PreviewState } from "@/lib/preview";
import { MiniMap } from "./MiniMap";

const SERVER: PreviewState = { kind: null, x: 0, y: 0 };
const MAP_W = 360;
const BROWSER_W = 420;
const BROWSER_BODY_H = 280;
// the live site renders desktop-width, scaled down to fit the mini browser
const PAGE_W = 1260;
const SCALE = BROWSER_W / PAGE_W;

// fades in once the screenshot has decoded (re-keyed per src in the layer)
function PreviewImage({ src }: { src: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      className="absolute inset-0 h-full w-full object-cover object-top"
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 350ms ease" }}
    />
  );
}

// real site in a scaled-down iframe, screenshot stays behind until it loads
function LiveSite({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <iframe
      src={url}
      tabIndex={-1}
      aria-hidden
      onLoad={() => setLoaded(true)}
      className="absolute top-0 left-0 origin-top-left border-0 bg-transparent"
      style={{
        width: PAGE_W,
        height: BROWSER_BODY_H / SCALE,
        transform: `scale(${SCALE})`,
        opacity: loaded ? 1 : 0,
        transition: "opacity 400ms ease",
        pointerEvents: "none",
      }}
    />
  );
}

function host(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function PreviewLayer() {
  const s = useSyncExternalStore(preview.subscribe, preview.get, () => SERVER);
  const visible = s.kind !== null;

  const width = s.kind === "map" ? MAP_W : BROWSER_W;
  const height = s.kind === "map" ? 216 : BROWSER_BODY_H + 34;
  let left = s.x + 26;
  let top = s.y + 26;
  if (typeof window !== "undefined") {
    if (left + width > window.innerWidth - 16) left = s.x - width - 26;
    if (top + height > window.innerHeight - 16) top = s.y - height - 26;
    if (left < 16) left = 16;
    if (top < 16) top = 16;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[90] hidden transition-opacity duration-150 ease-out md:block"
      style={{ left, top, width, opacity: visible ? 1 : 0 }}
    >
      {s.kind === "map" ? (
        <MiniMap label={s.label} />
      ) : s.kind === "image" ? (
        <div className="overflow-hidden border border-line-3 bg-surface shadow-2xl shadow-black/70">
          {/* browser chrome */}
          <div className="flex h-[34px] items-center gap-3 border-b border-line bg-surface-2 px-3.5">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="flex flex-1 items-center gap-2 rounded-full bg-ink px-3 py-1">
              <span className="text-[9px] text-green">●</span>
              <span className="font-mono text-[11px] tracking-[0.04em] text-muted">
                {host(s.url) || (s.label ?? "preview").toLowerCase()}
              </span>
            </span>
          </div>
          {/* page: screenshot backdrop, live site fades in over it */}
          <div className="relative" style={{ height: BROWSER_BODY_H }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[11px] tracking-[0.08em] text-faint">
                LOADING {(s.label ?? "").toUpperCase()}…
              </span>
            </div>
            {s.src ? <PreviewImage key={s.src} src={s.src} /> : null}
            {s.embed && s.url ? <LiveSite key={s.url} url={s.url} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
