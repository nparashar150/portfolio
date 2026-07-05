"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { agentStatus, bandsRef, type AgentStatus } from "@/lib/agent/store";
import { gateStore, AGENT_START_EVENT, AGENT_END_EVENT } from "@/lib/gateStore";
import { Magnetic } from "./Magnetic";

const BARS = 15;
// idle waveform silhouette, matches the site's cell mark
const IDLE = [6, 14, 24, 12, 6, 18, 30, 16, 8, 22, 12, 6, 14, 8, 4];

function DockBars({ live }: { live: boolean }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!live) return;
    let raf = 0;
    const tick = () => {
      const bands = bandsRef.current;
      for (let i = 0; i < BARS; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const v = bands.length
          ? (bands[Math.floor((i / BARS) * bands.length)] ?? 0)
          : 0;
        el.style.height = `${Math.max(4, Math.min(30, v * 46))}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <div className="flex h-[30px] items-center gap-[3px]" aria-hidden>
      {IDLE.map((h, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`w-[3px] rounded-full ${live ? "bg-green" : "bg-green-dim"}`}
          style={{ height: h, transition: live ? undefined : "height 300ms ease" }}
        />
      ))}
    </div>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  return `${m}:${(sec % 60).toString().padStart(2, "0")}`;
}

export function TalkDock() {
  const status = useSyncExternalStore(
    agentStatus.subscribe,
    agentStatus.get,
    () => "idle" as AgentStatus,
  );
  const gateDone = useSyncExternalStore(gateStore.subscribe, gateStore.get, () => false);
  const [consoleVisible, setConsoleVisible] = useState(true);
  const [seconds, setSeconds] = useState(0);

  const live = status === "live";

  useEffect(() => {
    if (!live) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  // hide while the console section is on screen, it has its own controls
  useEffect(() => {
    const el = document.getElementById("console");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setConsoleVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toggle = () => {
    window.dispatchEvent(
      new Event(status === "idle" ? AGENT_START_EVENT : AGENT_END_EVENT),
    );
  };

  const show = gateDone && (!consoleVisible || live);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.25, scale: { type: "spring", visualDuration: 0.25, bounce: 0.15 } }}
        >
          <div className="flex items-center gap-5 rounded-full border border-line bg-surface/95 py-3 pr-7 pl-3 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur">
            <Magnetic strength={0.25}>
              <motion.button
                onClick={toggle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                disabled={status === "connecting"}
                aria-label={live ? "End call" : "Talk to the agent"}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-green disabled:opacity-60"
              >
                <span className="text-[13px] text-green-deep">
                  {live ? "■" : "▶"}
                </span>
              </motion.button>
            </Magnetic>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[13px] font-bold tracking-[0.08em] text-cream">
                {status === "connecting"
                  ? "CONNECTING…"
                  : live
                    ? "LIVE, SAY ANYTHING"
                    : "TAP TO TALK"}
              </span>
              <span className="font-mono text-[11px] tracking-[0.05em] text-muted">
                live voice agent · trained on me
              </span>
            </div>
            <DockBars live={live} />
            <span className="font-mono text-[11px] tracking-[0.05em] text-muted tabular-nums">
              {fmt(seconds)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
