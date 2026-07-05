"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { themeStore } from "@/lib/themeStore";
import { themeSweep } from "@/lib/themeSweep";
import { gateStore } from "@/lib/gateStore";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "dark" as const,
  );
  const gateDone = useSyncExternalStore(gateStore.subscribe, gateStore.get, () => false);

  // pick up whatever the no-flash script applied before hydration
  useEffect(() => {
    themeStore.init();
  }, []);

  const dark = theme === "dark";

  return (
    <motion.button
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        themeSweep(() => themeStore.set(dark ? "light" : "dark"), {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        });
      }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0 }}
      animate={gateDone ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.6 }}
      aria-label={dark ? "Switch to daylight theme" : "Switch to phosphor theme"}
      className="fixed top-5 right-5 z-[150] flex items-center gap-2 rounded-full border border-line bg-surface/90 px-4 py-2 backdrop-blur transition-colors hover:border-green/50"
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors ${dark ? "bg-green" : "bg-[#ff5a1f]"}`}
      />
      <span className="font-mono text-[11px] font-bold tracking-[0.08em] text-cream">
        {dark ? "DAYLIGHT" : "PHOSPHOR"}
      </span>
    </motion.button>
  );
}
