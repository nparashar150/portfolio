"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  agentStatus,
  micRef,
  micStore,
  bandsRef,
  type AgentStatus,
  consoleInViewStore,
} from "@/lib/agent/store";
import { Conversation } from "./agent/Conversation";
import { HangUpIcon, MicIcon, PlayIcon } from "./agent/CallIcons";
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
  const consoleVisible = useSyncExternalStore(
    consoleInViewStore.subscribe,
    consoleInViewStore.get,
    () => false,
  );
  const [seconds, setSeconds] = useState(0);
  const micOn = useSyncExternalStore(micStore.subscribe, micStore.get, () => true);

  const live = status === "live";

  useEffect(() => {
    if (!live) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  const toggle = () => {
    window.dispatchEvent(
      new Event(status === "idle" ? AGENT_START_EVENT : AGENT_END_EVENT),
    );
  };

  const show = gateDone && (!consoleVisible || live);
  // Expanded only when the call has nowhere else to live. Scrolling to the
  // console hands the thread over and collapses this back to a pill.
  const expanded = live && !consoleVisible;

  return (
    <>
      {/* Dim everything else so the call is the only thing in the room.
          It DOES take pointer events: without that, hovering a work row behind
          the scrim still fired the site-preview popup, which floated over the
          dimmed page mid-call. Wheel events still reach the document because
          nothing inside the scrim scrolls, so scrolling to the console — and
          the handoff that depends on it — keeps working. */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-30 bg-ink/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
      {show && (
        <motion.div
          layout
          className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 ${
            expanded ? "w-[min(92vw,640px)]" : ""
          }`}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          // Entrance keeps its own snap; only the dock<->console handoff uses
          // the shared spring, so the two never fight over the same frame.
          transition={{
            duration: 0.25,
            scale: { type: "spring", visualDuration: 0.25, bounce: 0.15 },
            layout: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <motion.div
            layout
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className={`flex flex-col gap-3 border border-line bg-surface/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur ${
              expanded ? "rounded-2xl p-3" : "rounded-full"
            }`}
            style={{ borderRadius: expanded ? 16 : 999 }}
          >
          {expanded && <Conversation compact />}
          <div className={`flex items-center gap-3 sm:gap-4 ${
            expanded ? "px-1 pb-1" : "py-2 pr-5 pl-2 sm:py-3 sm:pr-7 sm:pl-3"
          }`}>
            <Magnetic strength={0.25}>
              <motion.button
                onClick={() =>
                  live ? micRef.current?.(!micOn) : toggle()
                }
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                disabled={status === "connecting"}
                aria-label={
                  live
                    ? micOn
                      ? "Mute your microphone"
                      : "Unmute your microphone"
                    : "Talk to the agent"
                }
                aria-pressed={live ? !micOn : undefined}
                // The round green button is what people reach for mid-call, and
                // they reach for it expecting mute. So mid-call it IS mute.
                className={`flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-60 sm:h-[52px] sm:w-[52px] ${
                  live && !micOn ? "bg-line-3" : "bg-green"
                }`}
              >
                <span
                  className={
                    live && !micOn ? "text-cream" : "text-green-deep"
                  }
                >
                  {live ? (
                    <MicIcon muted={!micOn} size={20} />
                  ) : (
                    <PlayIcon size={20} />
                  )}
                </span>
              </motion.button>
            </Magnetic>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-bold tracking-[0.08em] text-cream sm:text-[13px]">
                {status === "connecting"
                  ? "CONNECTING…"
                  : live
                    ? "LIVE, SAY ANYTHING"
                    : "TAP TO TALK"}
              </span>
              <span className="hidden font-mono text-[11px] tracking-[0.05em] text-muted sm:block">
                answers now · books a real slot
              </span>
            </div>
            <div className="hidden sm:block">
              <DockBars live={live} />
            </div>
            <span
              className={`font-mono text-[11px] tracking-[0.05em] text-muted tabular-nums ${
                live ? "ml-auto" : "ml-auto hidden sm:inline"
              }`}
            >
              {fmt(seconds)}
            </span>
            {live && (
              <Magnetic strength={0.25}>
                <motion.button
                  onClick={toggle}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label="End call"
                  // A circle of equal weight to the mic, in red, at the far end
                  // of the row. Two round buttons is the shape language every
                  // call UI uses — a text pill beside a circle reads as a
                  // secondary action, which hanging up is not.
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-white sm:h-[52px] sm:w-[52px]"
                >
                  <HangUpIcon size={20} />
                </motion.button>
              </Magnetic>
            )}
          </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
