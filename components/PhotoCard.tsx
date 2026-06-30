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
      className={`relative overflow-hidden rounded-2xl border border-line shadow-[0_14px_50px_-26px_rgba(0,0,0,0.8)] ${className ?? ""}`}
    >
      {/* placeholder until a portrait is added at public/me.jpg */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(120%_120%_at_50%_0%,#1c1e27,#101218)]">
        <span className="font-display text-5xl font-black text-line-3">NP</span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-faint">
          ADD public/me.jpg
        </span>
      </div>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Naman Parashar"
          onError={() => setOk(false)}
          className="relative h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}
