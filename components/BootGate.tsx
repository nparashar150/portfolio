"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { gateStore } from "@/lib/gateStore";

const EASE = [0.76, 0, 0.24, 1] as const;
const COLS = 13;
const ROWS = 5;
// waveform silhouette, column heights 1..5
const LEVELS = [1, 2, 4, 5, 3, 2, 5, 4, 2, 3, 4, 2, 1];

const COMMIT_FALLBACK = 3770;

function cellColor(col: number, row: number, lit: boolean) {
  if (!lit) return "var(--cell-1)";
  const level = LEVELS[col];
  const up = Math.floor((level - 1) / 2);
  const down = Math.ceil((level - 1) / 2);
  const d = row - 2; // distance from center row
  if (d < -up || d > down) return "var(--cell-1)";
  const abs = Math.abs(d);
  return abs === 0
    ? "var(--cell-4)"
    : abs === 1
      ? "var(--cell-3)"
      : "var(--cell-2)";
}

export function BootGate() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "leaving" | "gone">("boot");
  const [commits, setCommits] = useState(COMMIT_FALLBACK);
  const leftRef = useRef(false);

  // real contribution count, resolved from cache well before the line shows
  useEffect(() => {
    fetch("/api/commits")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.total === "number") setCommits(d.total);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // The loader always lifts into the hero, never a restored mid-page scroll.
    // But a deep link is intent, not restoration: /#console from a CV or a DM
    // must still land on the console once the curtain is up.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const target = window.location.hash.slice(1);
    window.scrollTo(0, 0);

    const leave = () => {
      if (leftRef.current) return;
      leftRef.current = true;
      document.body.style.overflow = "";
      setPhase("leaving");
      // hero starts revealing under the lifting curtain, no blank beat
      gateStore.finish();
      window.setTimeout(() => setPhase("gone"), 760);

      if (target) {
        // After the curtain, so the scroll isn't eaten by the overflow lock.
        window.setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ block: "start" });
        }, 780);
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setProgress(100);
      const t = window.setTimeout(leave, 250);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    let raf = 0;
    const start = performance.now();
    const DUR = 2200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      setProgress(Math.round((1 - Math.pow(1 - t, 2.4)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(leave, 350);
    };
    raf = requestAnimationFrame(tick);

    // requestAnimationFrame doesn't run in a background tab, so a page opened
    // via cmd-click would sit behind a frozen curtain with scroll locked until
    // it was looked at. The curtain must never be the thing keeping the page
    // hostage, so lift it on a wall-clock timer no matter what rAF is doing.
    const failsafe = window.setTimeout(leave, DUR + 1200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const litCols = Math.round((progress / 100) * COLS);

  const logLines = [
    { text: "$ naman --wake", at: 0 },
    {
      text: `[ ok ] commits.......... ${commits.toLocaleString("en-US")} loaded`,
      at: 18,
    },
    { text: "[ ok ] voice agent...... live", at: 42 },
    { text: "[ .. ] here you are", at: 78, green: true },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-ink"
      animate={phase === "leaving" ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 0.76, ease: EASE }}
      aria-hidden
    >
      <div className="flex h-full flex-col items-center justify-center gap-9 px-6">
        {/* boot log */}
        <div className="flex w-fit flex-col gap-1.5">
          {logLines.map((line) => (
            <span
              key={line.text}
              className={`font-mono text-xs tracking-[0.04em] whitespace-nowrap transition-opacity duration-300 ${
                line.green ? "text-green" : "text-muted"
              } ${progress >= line.at ? "opacity-100" : "opacity-0"}`}
            >
              {line.text}
            </span>
          ))}
        </div>

        {/* cells assembling into a waveform */}
        <div
          className="grid gap-[5px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 16px)` }}
        >
          {Array.from({ length: COLS * ROWS }).map((_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            return (
              <span
                key={i}
                className="h-4 w-4 rounded-[3px]"
                style={{
                  backgroundColor: cellColor(col, row, col < litCols),
                  transition: "background-color 240ms ease",
                }}
              />
            );
          })}
        </div>

        <span className="font-mono text-[13px] tracking-[0.06em] text-muted">
          a year of commits, ready to speak
          <span className="font-bold text-green tabular-nums"> · {progress}%</span>
        </span>
      </div>
    </motion.div>
  );
}
