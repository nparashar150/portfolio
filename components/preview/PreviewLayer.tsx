"use client";

import { useSyncExternalStore } from "react";
import { preview, type PreviewState } from "@/lib/preview";
import { MiniMap } from "./MiniMap";

const SERVER: PreviewState = { kind: null, x: 0, y: 0 };
const WIDTH = 360;

export function PreviewLayer() {
  const s = useSyncExternalStore(preview.subscribe, preview.get, () => SERVER);
  const visible = s.kind !== null;

  const height = s.kind === "map" ? 216 : 224;
  let left = s.x + 26;
  let top = s.y + 26;
  if (typeof window !== "undefined") {
    if (left + WIDTH > window.innerWidth - 16) left = s.x - WIDTH - 26;
    if (top + height > window.innerHeight - 16) top = s.y - height - 26;
    if (left < 16) left = 16;
    if (top < 16) top = 16;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[90] hidden transition-opacity duration-150 ease-out md:block"
      style={{ left, top, width: WIDTH, opacity: visible ? 1 : 0 }}
    >
      {s.kind === "map" ? (
        <MiniMap label={s.label} />
      ) : s.kind === "image" ? (
        <div className="relative h-[210px] w-full overflow-hidden border border-line-3 bg-surface-2 shadow-2xl shadow-black/60">
          {/* placeholder shown until an image is dropped in /public/previews */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-faint">
              {(s.label ?? "preview").toUpperCase()}
            </span>
            <span className="font-mono text-[10px] tracking-[0.06em] text-line-3">
              preview coming soon
            </span>
          </div>
          {s.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.src}
              alt=""
              className="relative h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
