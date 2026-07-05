"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { themeStore } from "@/lib/themeStore";
import { themeSweep } from "@/lib/themeSweep";

// lives inline in the hero status row
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.get,
    () => "dark" as const,
  );

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
      aria-label={dark ? "Switch to daylight theme" : "Switch to phosphor theme"}
      className="flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-2 transition-colors hover:border-green/50 sm:px-3.5"
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors ${dark ? "bg-green" : "bg-[#ff5a1f]"}`}
      />
      <span className="hidden font-mono text-[11px] font-bold tracking-[0.08em] text-cream sm:inline">
        {dark ? "DAYLIGHT" : "PHOSPHOR"}
      </span>
    </motion.button>
  );
}
