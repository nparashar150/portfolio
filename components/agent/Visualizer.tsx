"use client";

import { useCallback, useEffect, useRef } from "react";
import { bandsRef } from "@/lib/agent/store";

const COLS = 34;
const ROWS = 7;
const CENTER = (ROWS - 1) / 2;

// GitHub contribution palette (idle)
const GH = ["#16201a", "#0e4429", "#006d32", "#26a641", "#39d353"];
// dark → bright green ramp for the live waveform (graded by amplitude)
const LIVE = ["#16321f", "#15803d", "#16a34a", "#22c55e", "#4ade80"];
const SCALE = 1.9; // mic/agent volume gain into the 0..1 range

const frac = (x: number) => x - Math.floor(x);
function commitLevel(c: number, r: number) {
  // denser distribution + reshuffled seed so there are no empty dead corners
  const v = frac(Math.sin((c + 1) * 24.317 + (r + 1) * 9.137) * 41719.13);
  if (v < 0.26) return 0;
  if (v < 0.5) return 1;
  if (v < 0.72) return 2;
  if (v < 0.89) return 3;
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
          // column amplitude × vertical falloff from the center row → graded energy
          const vol = Math.min(1, (bands[col] ?? 0) * SCALE);
          const fall = 1 - Math.abs(row - CENTER) / (CENTER + 1);
          const energy = vol * fall; // 0..1
          const level = Math.max(0, Math.min(4, Math.floor(energy * 5)));
          el.style.backgroundColor = LIVE[level];
          el.style.transform = `scale(${0.8 + energy * 0.2})`;
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
