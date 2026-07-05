"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { gateStore } from "@/lib/gateStore";

// holds everything below the hero back until its entrance has played out
export function AfterHero({ children }: { children: ReactNode }) {
  const gateDone = useSyncExternalStore(
    gateStore.subscribe,
    gateStore.get,
    () => false,
  );
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!gateDone) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setShow(true), reduced ? 0 : 1200);
    return () => window.clearTimeout(t);
  }, [gateDone]);

  return (
    <div style={{ opacity: show ? 1 : 0, transition: "opacity 650ms ease" }}>
      {children}
    </div>
  );
}
