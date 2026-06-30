"use client";

import { useEffect, useState } from "react";
import { loaderState } from "@/lib/loaderState";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ$#%&*<>/=+";
const L1 = "NAMAN";
const L2 = "PARASHAR";
const STAGGER = 60; // ms between characters resolving
const REVEAL = 280; // ms a character spends scrambling before it locks

const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

export function ScrambleName({ className }: { className?: string }) {
  const [d1, setD1] = useState(L1);
  const [d2, setD2] = useState(L2);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    let raf = 0;
    const run = () => {
      setShown(true);
      const start = performance.now();
      const off2 = L1.length * STAGGER; // line 2 begins as line 1 finishes
      const end = off2 + L2.length * STAGGER + REVEAL;

      const tick = (now: number) => {
        const e = now - start;
        setD1(
          L1.split("")
            .map((ch, i) => (e > i * STAGGER + REVEAL ? ch : rand()))
            .join(""),
        );
        setD2(
          L2.split("")
            .map((ch, i) => (e > off2 + i * STAGGER + REVEAL ? ch : rand()))
            .join(""),
        );
        if (e < end) raf = requestAnimationFrame(tick);
        else {
          setD1(L1);
          setD2(L2);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const off = loaderState.onDone(run);
    return () => {
      off();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <h1
      className={className}
      style={{ opacity: shown ? 1 : 0, transition: "opacity 120ms ease" }}
    >
      {d1}
      <br />
      {d2}
      <span className="text-green">.</span>
    </h1>
  );
}
