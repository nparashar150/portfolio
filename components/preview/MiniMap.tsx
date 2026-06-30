// stylized dark-mode mini map (no external tiles / keys) with a green pin
export function MiniMap({ label }: { label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line-3 bg-[#0b0f0d] shadow-2xl shadow-black/60">
      <svg viewBox="0 0 360 180" className="block w-full">
        <rect width="360" height="180" fill="#0b0f0d" />

        {/* faint street grid */}
        <g stroke="#16241c" strokeWidth="1">
          {[30, 60, 90, 120, 150, 210, 240, 270, 300, 330].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" />
          ))}
          {[30, 60, 90, 120, 150].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} />
          ))}
        </g>

        {/* arterial roads */}
        <g stroke="#1f3a2c" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M0 130 L150 70 L360 110" />
          <path d="M40 0 L120 90 L90 180" />
          <path d="M360 40 L200 100 L260 180" />
        </g>

        {/* a river */}
        <path
          d="M0 60 C 90 40, 130 110, 220 80 S 320 120, 360 90"
          stroke="#163b3a"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />

        {/* pin */}
        <circle cx="180" cy="92" r="22" fill="#22c55e" opacity="0.12" />
        <circle cx="180" cy="92" r="12" fill="#22c55e" opacity="0.22" />
        <circle cx="180" cy="92" r="5.5" fill="#4ade80" />
        <circle cx="180" cy="92" r="2" fill="#07130d" />
      </svg>

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.06em] text-cream">
          {label ?? "Delhi, India"}
        </span>
        <span className="font-mono text-[11px] tracking-[0.06em] text-green">
          28.68°N 77.38°E
        </span>
      </div>
    </div>
  );
}
