"use client";

import { useState } from "react";

export function PhotoCard({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div
      className={`group relative overflow-hidden border border-line ${className ?? ""}`}
    >
      {/* placeholder until a portrait is added at public/me.jpg */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(120%_120%_at_50%_0%,#1c1e27,#101218)]">
        <span className="font-display text-5xl font-black text-line-3">NP</span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-faint">
          ADD public/me.jpg
        </span>
      </div>
      {ok ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Naman Parashar"
            onError={() => setOk(false)}
            className="relative h-full w-full origin-top-right object-cover grayscale contrast-[1.06] brightness-[0.92] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07] group-hover:grayscale-0 group-hover:brightness-100"
          />
          {/* green wash, lifts on hover to reveal color */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(34,197,94,0.06),rgba(7,19,13,0.35))] transition-opacity duration-500 group-hover:opacity-0" />
          <div className="absolute bottom-0 left-0 flex items-center gap-2 bg-ink/85 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            <span className="font-mono text-[11px] tracking-[0.08em] text-cream">
              NAMAN, IRL
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
