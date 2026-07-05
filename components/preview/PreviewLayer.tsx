"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { preview, type PreviewState } from "@/lib/preview";
import { config } from "@/lib/config";
import { MiniMap } from "./MiniMap";

const SERVER: PreviewState = { kind: null, x: 0, y: 0 };
const MAP_W = 360;
const BROWSER_W = 420;
const BROWSER_BODY_H = 280;
// live sites render desktop-width, scaled down to fit the mini browser
const PAGE_W = 1260;
const SCALE = BROWSER_W / PAGE_W;

// fades in once the screenshot has decoded (non-embed fallback)
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

// sites paint progressively, so reveal early instead of waiting for the full
// load event (heavy marketing scripts delay it by many seconds)
function CachedFrame({
  url,
  active,
  onReady,
}: {
  url: string;
  active: boolean;
  onReady: () => void;
}) {
  useEffect(() => {
    const t = window.setTimeout(onReady, 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <iframe
      src={url}
      tabIndex={-1}
      onLoad={onReady}
      className="absolute top-0 left-0 origin-top-left border-0 bg-transparent"
      style={{
        width: PAGE_W,
        height: BROWSER_BODY_H / SCALE,
        transform: `scale(${SCALE})`,
        opacity: active ? 1 : 0,
        transition: "opacity 300ms ease",
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

  // every live url ever hovered stays mounted, so the site loads once and
  // every later hover is instant
  const [cache, setCache] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (s.kind === "image" && s.embed && s.url) {
      setCache((c) => (c.includes(s.url!) ? c : [...c, s.url!]));
    }
  }, [s.kind, s.embed, s.url]);

  // warm every embeddable site shortly after load, so first hover is instant
  useEffect(() => {
    const t = window.setTimeout(() => {
      const urls = [
        ...config.work.filter((w) => w.embed).map((w) => w.url),
        ...(config.featured.embed ? [config.featured.url] : []),
        ...config.projects.filter((p) => p.embed).map((p) => p.url),
      ];
      setCache((c) => [...c, ...urls.filter((u) => !c.includes(u))]);
    }, 4000);
    return () => window.clearTimeout(t);
  }, []);

  const isEmbed = Boolean(s.embed && s.url);
  const activeLoaded = isEmbed && s.url ? loaded[s.url] : false;

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
      <div style={{ display: s.kind === "map" ? "block" : "none" }}>
        <MiniMap label={s.label} />
      </div>

      {/* mini browser, always mounted so cached live sites survive hovers */}
      <div
        className="overflow-hidden border border-line-3 bg-surface shadow-2xl shadow-black/70"
        style={{ display: s.kind === "image" ? "block" : "none" }}
      >
        {/* chrome */}
        <div className="flex h-[34px] items-center gap-3 border-b border-line bg-surface-2 px-3.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="flex flex-1 items-center gap-2 rounded-full bg-ink px-3 py-1">
            <span
              className={`text-[9px] ${isEmbed && !activeLoaded ? "animate-pulse text-[#febc2e]" : "text-green"}`}
            >
              ●
            </span>
            <span className="font-mono text-[11px] tracking-[0.04em] text-muted">
              {host(s.url) || (s.label ?? "preview").toLowerCase()}
            </span>
          </span>
        </div>

        {/* page */}
        <div className="relative bg-ink" style={{ height: BROWSER_BODY_H }}>
          {/* loading state while the live site boots */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-[2px] bg-green-dim [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-pulse rounded-[2px] bg-[var(--cell-3)] [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-[2px] bg-green [animation-delay:300ms]" />
            </span>
            <span className="font-mono text-[11px] tracking-[0.08em] text-muted">
              LOADING {host(s.url).toUpperCase() || "PREVIEW"}…
            </span>
          </div>

          {/* non-embed fallback: static screenshot */}
          {!isEmbed && s.src ? <PreviewImage key={s.src} src={s.src} /> : null}

          {/* cached live sites, only the hovered one is visible */}
          {cache.map((url) => (
            <CachedFrame
              key={url}
              url={url}
              active={url === s.url && Boolean(loaded[url])}
              onReady={() => setLoaded((m) => (m[url] ? m : { ...m, [url]: true }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
