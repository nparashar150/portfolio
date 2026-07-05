"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { config } from "@/lib/config";
import { gateStore } from "@/lib/gateStore";
import { Previewable } from "./preview/Previewable";

const EASE = [0.76, 0, 0.24, 1] as const;

const frac = (x: number) => x - Math.floor(x);
function cellTone(c: number, r: number) {
  const v = frac(Math.sin((c + 1) * 24.317 + (r + 1) * 9.137) * 41719.13);
  if (v < 0.55) return "#0e2c1a";
  if (v < 0.78) return "#15803d";
  if (v < 0.93) return "#16a34a";
  return "#31ff7a";
}

function useDelhiTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function NameLine({
  children,
  done,
  delay,
}: {
  children: React.ReactNode;
  done: boolean;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block whitespace-nowrap"
        initial={reduced ? false : { y: "112%" }}
        animate={done ? { y: 0 } : {}}
        transition={{ duration: 1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const done = useSyncExternalStore(gateStore.subscribe, gateStore.get, () => false);
  const time = useDelhiTime();

  return (
    <section id="top" className="w-full overflow-hidden pt-10 pb-14">
      <div className="mx-auto w-full max-w-[1080px] px-6">
        {/* status row */}
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0 }}
          animate={done ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="flex items-center gap-3 pt-1">
            <span className="h-[7px] w-[7px] rounded-full bg-green animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-[0.06em] text-cream">
              OPEN TO WORK
            </span>
            <span className="font-mono text-xs tracking-[0.06em] text-muted">
              · DELHI {time || "--:--"} IST
            </span>
          </div>
          {/* commit-cell fragment, becomes the reactive field later */}
          <div
            className="hidden gap-[4px] lg:grid"
            style={{ gridTemplateColumns: "repeat(13, 12px)" }}
            aria-hidden
          >
            {Array.from({ length: 13 * 4 }).map((_, i) => (
              <span
                key={i}
                className="h-[12px] w-[12px] rounded-[2.5px]"
                style={{ backgroundColor: cellTone(i % 13, Math.floor(i / 13)) }}
              />
            ))}
          </div>
        </motion.div>

        {/* name */}
        <h1 className="pt-14 font-display font-black uppercase leading-[0.9] tracking-[-0.045em] text-cream text-[clamp(52px,14.5vw,158px)]">
          <NameLine done={done} delay={0.05}>
            Naman
          </NameLine>
          <NameLine done={done} delay={0.14}>
            Parashar<span className="text-green">.</span>
          </NameLine>
        </h1>

        {/* lower band */}
        <motion.div
          className="flex flex-col items-start justify-between gap-8 pt-10 md:flex-row md:items-end"
          initial={{ opacity: 0, y: 24 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.28 }}
        >
          <div className="flex max-w-[500px] flex-col gap-4">
            <div className="h-[2px] w-11 bg-green" />
            <p className="text-base leading-relaxed text-muted-2 md:text-lg">
              {config.headline}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
            <Previewable
              kind="map"
              label="New Delhi, India"
              className="cursor-help font-mono text-xs tracking-[0.06em] text-muted transition-colors hover:text-cream"
            >
              28.7035° N / 77.4175° E
            </Previewable>
            <span className="font-mono text-xs tracking-[0.06em] text-muted">
              NEW DELHI, IND · REMOTE OK
            </span>
            <span className="font-mono text-xs tracking-[0.06em] text-green">
              SCROLL, OR JUST SAY HI ↓
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
