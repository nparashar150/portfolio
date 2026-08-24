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

  // Visibility is driven by CSS (`.reveal-gate`, gated on `html.js`) so that
  // without JavaScript the content stays visible for crawlers/agents. When JS is
  // present it starts hidden and we flip `data-show` once the boot has played.
  return (
    <div className="reveal-gate" data-show={show ? "true" : undefined}>
      {children}
    </div>
  );
}
