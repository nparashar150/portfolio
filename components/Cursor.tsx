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
