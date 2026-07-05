"use client";

import { useEffect, useRef } from "react";

const SIZE = 18; // the invisible pixel/grid size (matches the GitHub-graph cell)
const N = 8; // trail length, in grid cells

export function Cursor() {
  const dots = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    // history of distinct grid cells, newest first
    const history: Array<{ x: number; y: number }> = [];
    let cx = -1;
    let cy = -1;
    let lastMove = 0;

    const render = () => {
      for (let i = 0; i < N; i++) {
        const el = dots.current[i];
        if (!el) continue;
        const h = history[i];
        if (h) {
          el.style.transform = `translate(${h.x}px, ${h.y}px)`;
          el.style.opacity = String((1 - i / N) * 0.85);
        } else {
          el.style.opacity = "0";
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const nx = Math.floor(e.clientX / SIZE);
      const ny = Math.floor(e.clientY / SIZE);
      lastMove = performance.now();
      if (nx === cx && ny === cy) return; // still in the same cell → don't move
      cx = nx;
      cy = ny;
      history.unshift({ x: nx * SIZE, y: ny * SIZE });
      if (history.length > N) history.pop();
      document.documentElement.classList.add("cursor-on");
      render();
    };

    const onLeave = () => {
      document.documentElement.classList.remove("cursor-on");
    };

    // when the mouse stops, let the tail recede one cell at a time (comet fade)
    const decay = setInterval(() => {
      if (history.length > 1 && performance.now() - lastMove > 55) {
        history.pop();
        render();
      }
    }, 55);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      clearInterval(decay);
      document.documentElement.classList.remove("cursor-on");
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[300] hidden opacity-0 transition-opacity duration-200 md:block [.cursor-on_&]:opacity-100"
    >
      {Array.from({ length: N }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            dots.current[i] = el;
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SIZE - 2,
            height: SIZE - 2,
            margin: 1,
            borderRadius: 3,
            background:
              i === 0 ? "var(--color-green-bright)" : "var(--color-green)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
