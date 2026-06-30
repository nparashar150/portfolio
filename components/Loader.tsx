"use client";

import { memo, useEffect, useState } from "react";
import { loaderState } from "@/lib/loaderState";

const COLS = 34;
const ROWS = 7;
const GH = ["#16201a", "#0e4429", "#006d32", "#26a641", "#39d353"];
const SECTIONS = ["work", "projects", "about", "contact"];

const frac = (x: number) => x - Math.floor(x);
function commitLevel(c: number, r: number) {
  const v = frac(Math.sin((c + 1) * 24.317 + (r + 1) * 9.137) * 41719.13);
  if (v < 0.26) return 0;
  if (v < 0.5) return 1;
  if (v < 0.72) return 2;
  if (v < 0.89) return 3;
  return 4;
}

// re-renders only when the revealed-column count changes, not every frame
const LoaderGrid = memo(function LoaderGrid({ litCols }: { litCols: number }) {
  return (
    <div
      className="grid w-full gap-[5px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const bg =
          col < litCols - 1
            ? GH[commitLevel(col, row)]
            : col === litCols - 1
              ? "#4ade80"
              : "#16201a";
        return (
          <span
            key={i}
            className="aspect-square rounded-[3px]"
            style={{ backgroundColor: bg, transition: "background-color 220ms ease" }}
          />
        );
      })}
    </div>
  );
});

export function Loader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const finish = () => {
      setProgress(100);
      setDone(true);
      loaderState.markDone(); // hero animates in as the loader wipes away
      document.body.style.overflow = "";
      window.setTimeout(() => setHidden(true), 700);
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      const t = window.setTimeout(finish, 250);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    let raf = 0;
    const start = performance.now();
    const DUR = 3200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 2);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (hidden) return null;

  const litCols = Math.round((progress / 100) * COLS);
  const checked = Math.floor((progress / 100) * SECTIONS.length);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-11 bg-ink"
      style={{
        clipPath: done ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
        transition: "clip-path 700ms cubic-bezier(0.7, 0, 0.2, 1)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="flex items-center gap-1.5 select-none">
          <span className="font-display text-5xl font-extrabold tracking-[-0.04em] text-cream md:text-6xl">
            naman
          </span>
          <span className="animate-blink bg-green" style={{ width: 22, height: 46 }} />
        </span>
        <span className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          <span className="font-mono text-xs tracking-[0.1em] text-muted">
            COMPILING PORTFOLIO
          </span>
        </span>
      </div>

      <div className="w-full max-w-[820px] px-6">
        <LoaderGrid litCols={litCols} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 px-6 text-center">
        <span className="font-mono text-[15px] font-bold tracking-[0.04em] text-green">
          {progress.toString().padStart(2, "0")}%
        </span>
        <span className="font-mono text-[13px] tracking-[0.08em] text-muted">
          BUILDING SECTIONS
        </span>
        <span className="font-mono text-[13px] tracking-[0.04em]">
          {SECTIONS.map((s, i) => (
            <span key={s} className={i < checked ? "text-[#5a8a6e]" : "text-line-3"}>
              {s}
              {i < checked ? " ✓ " : "  "}
            </span>
          ))}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#161616]">
        <div
          className="h-full bg-green"
          style={{ width: `${progress}%`, transition: "width 80ms linear" }}
        />
      </div>
    </div>
  );
}
