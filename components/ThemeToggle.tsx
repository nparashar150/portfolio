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
      className="fixed top-4 right-4 z-[150] flex items-center gap-2 rounded-full border border-line bg-surface/90 p-2.5 backdrop-blur transition-colors hover:border-green/50 sm:top-5 sm:right-5 sm:px-4 sm:py-2"
    >
      <span
        className={`h-2.5 w-2.5 rounded-full transition-colors sm:h-2 sm:w-2 ${dark ? "bg-green" : "bg-[#ff5a1f]"}`}
      />
      <span className="hidden font-mono text-[11px] font-bold tracking-[0.08em] text-cream sm:inline">
        {dark ? "DAYLIGHT" : "PHOSPHOR"}
      </span>
    </motion.button>
  );
}
