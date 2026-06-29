"use client";

import { useCallback, useEffect, useRef } from "react";
import { bandsRef } from "@/lib/agent/store";

const COLS = 34;
const ROWS = 7;
const CENTER = (ROWS - 1) / 2;

// GitHub contribution palette (idle)
const GH = ["#16201a", "#0e4429", "#006d32", "#26a641", "#39d353"];

const frac = (x: number) => x - Math.floor(x);
function commitLevel(c: number, r: number) {
  const v = frac(Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233) * 43758.5453);
  if (v < 0.46) return 0;
  if (v < 0.7) return 1;
  if (v < 0.86) return 2;
  if (v < 0.96) return 3;
  return 4;
}

export function Visualizer({ live }: { live: boolean }) {
  const cells = useRef<Array<HTMLSpanElement | null>>([]);
  const liveRef = useRef(live);
  liveRef.current = live;

  const paintIdle = useCallback(() => {
    for (let i = 0; i < COLS * ROWS; i++) {
      const el = cells.current[i];
      if (!el) continue;
      el.style.backgroundColor = GH[commitLevel(i % COLS, Math.floor(i / COLS))];
      el.style.transform = "scale(1)";
    }
  }, []);

  // single rAF loop; animates only while live (driven by the agent's audio)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (liveRef.current) {
        const bands = bandsRef.current;
        for (let i = 0; i < COLS * ROWS; i++) {
          const el = cells.current[i];
          if (!el) continue;
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const vol = Math.min(1, (bands[col] ?? 0) * 3.6);
          const litRadius = Math.pow(vol, 0.45) * 3.6;
          const lit = Math.abs(row - CENTER) <= litRadius;
          el.style.backgroundColor = lit
            ? vol > 0.8
              ? "#4ade80"
              : "#22c55e"
            : "#16321f";
          el.style.transform = lit ? "scale(1)" : "scale(0.78)";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // paint / restore the commit graph whenever we drop out of live
  useEffect(() => {
    if (!live) paintIdle();
  }, [live, paintIdle]);

  return (
    <div
      className="grid gap-[5px] md:gap-[6px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: COLS * ROWS }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            cells.current[i] = el;
          }}
          className="aspect-square rounded-[3px]"
          style={{
            backgroundColor: GH[commitLevel(i % COLS, Math.floor(i / COLS))],
            transition: "background-color 130ms linear, transform 130ms linear",
          }}
        />
      ))}
    </div>
  );
}
