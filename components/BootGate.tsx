"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { gateStore } from "@/lib/gateStore";

const EASE = [0.76, 0, 0.24, 1] as const;
const COLS = 13;
const ROWS = 5;
// waveform silhouette, column heights 1..5
const LEVELS = [1, 2, 4, 5, 3, 2, 5, 4, 2, 3, 4, 2, 1];

const LOG_LINES = [
  { text: "$ naman --wake", at: 0 },
  { text: "[ ok ] commits.......... 1,204 loaded", at: 18 },
  { text: "[ ok ] voice agent...... ringg.ai live", at: 42 },
  { text: "[ .. ] here you are", at: 78, green: true },
];

function cellColor(col: number, row: number, lit: boolean) {
  if (!lit) return "#0e2c1a";
  const level = LEVELS[col];
  const up = Math.floor((level - 1) / 2);
  const down = Math.ceil((level - 1) / 2);
  const d = row - 2; // distance from center row
  if (d < -up || d > down) return "#0e2c1a";
  const abs = Math.abs(d);
  return abs === 0 ? "#31ff7a" : abs === 1 ? "#16a34a" : "#15803d";
}

export function BootGate() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "leaving" | "gone">("boot");
  const leftRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const leave = () => {
      if (leftRef.current) return;
      leftRef.current = true;
      document.body.style.overflow = "";
      setPhase("leaving");
      window.setTimeout(() => {
        gateStore.finish();
        setPhase("gone");
      }, 760);
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

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "gone") return null;

  const litCols = Math.round((progress / 100) * COLS);

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
          {LOG_LINES.map((line) => (
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
