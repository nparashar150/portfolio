"use client";

import { useSyncExternalStore } from "react";
import { themeStore } from "@/lib/themeStore";

// real map: CARTO raster tiles (free, no API key), dark_all or light_all to
// match the theme, centered on the given coordinates with an accent pin.
const LAT = 28.7035087;
const LON = 77.4174775;
const Z = 14;
const W = 360;
const H = 184;
const TILE = 256;

function buildTiles() {
  const latRad = (LAT * Math.PI) / 180;
  const n = Math.pow(2, Z);
  const worldX = ((LON + 180) / 360) * n * TILE;
  const worldY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    n *
    TILE;
  const originX = worldX - W / 2;
  const originY = worldY - H / 2;

  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + W) / TILE); tx++) {
    for (let ty = Math.floor(originY / TILE); ty <= Math.floor((originY + H) / TILE); ty++) {
      if (ty < 0 || ty >= n) continue;
      tiles.push({
        x: ((tx % n) + n) % n,
        y: ty,
        left: tx * TILE - originX,
        top: ty * TILE - originY,
      });
    }
  }
  return tiles;
}

export function MiniMap({ label }: { label?: string }) {
  const tiles = buildTiles();
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "dark" as const,
  );
  const style = theme === "light" ? "light_all" : "dark_all";
  return (
    <div className="overflow-hidden border border-line-3 bg-surface-2 shadow-2xl shadow-black/60">
      <div
        className="relative overflow-hidden"
        style={{ width: W, height: H }}
      >
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${t.x}-${t.y}`}
            src={`https://a.basemaps.cartocdn.com/${style}/${Z}/${t.x}/${t.y}@2x.png`}
            alt=""
            width={TILE}
            height={TILE}
            className="absolute select-none"
            style={{ left: t.left, top: t.top }}
            draggable={false}
          />
        ))}

        {/* pin at the exact center */}
        <span className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green/15" />
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-bright ring-2 ring-surface-2" />

        <span className="absolute bottom-1 right-1.5 font-mono text-[8px] tracking-[0.04em] text-cream/40">
          © OSM · CARTO
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.06em] text-cream">
          {label ?? "New Delhi, India"}
        </span>
        <span className="font-mono text-[11px] tracking-[0.06em] text-green">
          28.70°N 77.42°E
        </span>
      </div>
    </div>
  );
}
