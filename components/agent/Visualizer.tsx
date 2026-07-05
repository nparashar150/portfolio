"use client";

import { useEffect, useRef } from "react";
import { bandsRef } from "@/lib/agent/store";

const COLS = 34;
const ROWS = 7;
const CENTER = (ROWS - 1) / 2;

// commit-cell ramp, themed via CSS variables (idle contribution graph)
const GH = [0, 1, 2, 3, 4].map((i) => `var(--cell-${i})`);
// quiet → loud ramp for the live waveform (graded by amplitude)
const LIVE = [
  "var(--cell-1)",
  "var(--cell-2)",
  "var(--cell-3)",
  "var(--cell-4)",
  "var(--color-green-bright)",
];
const SCALE = 1.9; // mic/agent volume gain into the 0..1 range
const STAGGER = 16; // ms between columns during the morph sweep
const TAIL = 240; // ms after the last column flips

const frac = (x: number) => x - Math.floor(x);
function commitLevel(c: number, r: number) {
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
  const morph = useRef<{ active: boolean; start: number; dir: "in" | "out" }>({
    active: false,
    start: 0,
    dir: "in",
  });
  const inited = useRef(false);

  // single rAF loop handling idle commit graph, the morph sweep, and live audio
  useEffect(() => {
    let raf = 0;

    const paintIdle = () => {
      for (let i = 0; i < COLS * ROWS; i++) {
        const el = cells.current[i];
        if (!el) continue;
        el.style.backgroundColor = GH[commitLevel(i % COLS, Math.floor(i / COLS))];
        el.style.transform = "scale(1)";
      }
    };

    const loop = () => {
      const now = performance.now();
      const isLive = liveRef.current;
      const m = morph.current;

      if (isLive || m.active) {
        const bands = bandsRef.current;
        const elapsed = m.active ? now - m.start : Infinity;
        for (let i = 0; i < COLS * ROWS; i++) {
          const el = cells.current[i];
          if (!el) continue;
          const col = i % COLS;
          const row = Math.floor(i / COLS);

          // waveform target for this cell
          const vol = Math.min(1, (bands[col] ?? 0) * SCALE);
          const fall = 1 - Math.abs(row - CENTER) / (CENTER + 1);
          const energy = vol * fall;
          const wLevel = Math.max(0, Math.min(4, Math.floor(energy * 5)));

          // which face does this column show right now?
          let showWave = true;
          if (m.active) {
            const revealed = elapsed > col * STAGGER;
            showWave = m.dir === "in" ? revealed : !revealed;
          }

          if (showWave) {
            el.style.backgroundColor = LIVE[wLevel];
            el.style.transform = `scale(${0.8 + energy * 0.2})`;
          } else {
            el.style.backgroundColor = GH[commitLevel(col, row)];
            el.style.transform = "scale(1)";
          }
        }

        if (m.active && elapsed > (COLS - 1) * STAGGER + TAIL) {
          morph.current = { ...m, active: false };
          if (m.dir === "out") paintIdle();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    paintIdle();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // start a morph whenever live toggles (skip the initial mount)
  useEffect(() => {
    if (!inited.current) {
      inited.current = true;
      return;
    }
    morph.current = {
      active: true,
      start: performance.now(),
      dir: live ? "in" : "out",
    };
  }, [live]);

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
            transition: "background-color 150ms ease, transform 150ms ease",
          }}
        />
      ))}
    </div>
  );
}
