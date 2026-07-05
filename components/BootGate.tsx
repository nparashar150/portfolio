"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { gateStore, AGENT_START_EVENT } from "@/lib/gateStore";
import { Magnetic } from "./Magnetic";

const EASE = [0.76, 0, 0.24, 1] as const;
const COLS = 13;
const ROWS = 5;
// waveform silhouette, column heights 1..5
const LEVELS = [1, 2, 4, 5, 3, 2, 5, 4, 2, 3, 4, 2, 1];

const LOG_LINES = [
  { text: "$ naman --wake", at: 0 },
  { text: "[ ok ] commits.......... 1,204 loaded", at: 18 },
  { text: "[ ok ] voice agent...... ringg.ai live", at: 42 },
  { text: "[ .. ] waiting for you", at: 70, green: true },
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
  const leavingRef = useRef(false);

  // skip the gate on repeat visits this session
  const [skipped] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("gate-done") === "1";
  });

  useEffect(() => {
    if (skipped) {
      gateStore.finish();
      return;
    }
    document.body.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setProgress(100);
      return () => {
        document.body.style.overflow = "";
      };
    }

    let raf = 0;
    const start = performance.now();
    const DUR = 2100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      setProgress(Math.round((1 - Math.pow(1 - t, 2.4)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [skipped]);

  const leave = async (withVoice: boolean) => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (withVoice) {
      // tie mic permission to this click so the agent starts instantly later
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        withVoice = false; // denied mic, enter quiet instead
      }
    }

    sessionStorage.setItem("gate-done", "1");
    setPhase("leaving");
    document.body.style.overflow = "";

    window.setTimeout(() => {
      gateStore.finish();
      if (withVoice) window.dispatchEvent(new Event(AGENT_START_EVENT));
      setPhase("gone");
    }, 780);
  };

  if (skipped || phase === "gone") return null;

  const litCols = Math.round((progress / 100) * COLS);
  const ready = progress >= 100;

  return (
    <motion.div
      className="native-cursor fixed inset-0 z-[200] bg-ink"
      animate={phase === "leaving" ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 0.78, ease: EASE }}
    >
      {/* one column, everything together */}
      <div className="flex h-full flex-col items-center justify-center gap-9 px-6">
        {/* boot log */}
        <div className="flex w-fit flex-col gap-1.5" aria-hidden>
          {LOG_LINES.map((line) => (
            <span
              key={line.text}
              className={`font-mono text-xs tracking-[0.04em] whitespace-nowrap transition-opacity duration-300 ${
                line.green ? "text-green" : "text-muted"
              } ${progress >= line.at ? "opacity-100" : "opacity-0"}`}
            >
              {ready && line.green ? "[ ok ] here you are" : line.text}
            </span>
          ))}
        </div>

        {/* cells assembling into a waveform */}
        <div
          className="grid gap-[5px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 16px)` }}
          aria-hidden
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

        {/* what this actually is */}
        <div className="flex max-w-[420px] flex-col items-center gap-2 text-center">
          <span className="font-mono text-[13px] tracking-[0.06em] text-cream">
            this is my last year of github commits
            <span className="font-bold text-green tabular-nums"> · {progress}%</span>
          </span>
          <span className="font-mono text-xs leading-relaxed tracking-[0.05em] text-muted">
            they double as a live voice agent trained on me. say hi and ask it
            anything, or just scroll.
          </span>
        </div>

        {/* enter CTAs */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Magnetic strength={0.2}>
            <motion.button
              onClick={() => leave(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!ready}
              className="flex items-center gap-3 rounded-full bg-green px-8 py-4 disabled:opacity-40"
            >
              <span className="h-2 w-2 rounded-full bg-green-deep" />
              <span className="font-mono text-sm font-bold tracking-[0.08em] text-green-deep">
                ENTER, TALK TO MY AGENT
              </span>
            </motion.button>
          </Magnetic>
          <button
            onClick={() => leave(false)}
            disabled={!ready}
            className="font-mono text-xs tracking-[0.06em] text-muted underline underline-offset-4 transition-colors hover:text-cream disabled:opacity-40"
          >
            enter quiet, just browsing
          </button>
          <span className="pt-1 font-mono text-[11px] tracking-[0.06em] text-faint">
            mic optional · nothing autoplays
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
