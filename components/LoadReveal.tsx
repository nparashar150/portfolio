"use client";

import { useEffect, useState, type ReactNode } from "react";
import { loaderState } from "@/lib/loaderState";

export function LoadReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    let t = 0;
    const off = loaderState.onDone(() => {
      t = window.setTimeout(() => setShown(true), delay);
    });
    return () => {
      off();
      clearTimeout(t);
    };
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(18px)",
        transition:
          "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
