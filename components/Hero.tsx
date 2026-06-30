import { config } from "@/lib/config";
import { Previewable } from "./preview/Previewable";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate mx-auto w-full max-w-[1240px] overflow-hidden px-6 pt-12 pb-10 md:px-10 lg:px-16 lg:pt-20"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[460px] w-[880px] max-w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(34,197,94,0.10),transparent_72%)] blur-2xl"
      />

      {/* eyebrow */}
      <div className="flex items-center justify-between pb-10 md:pb-12">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
          <span className="font-mono text-[13px] tracking-[0.06em] text-cream">
            {config.status.toUpperCase()}
          </span>
        </div>
        <Previewable
          kind="map"
          label="New Delhi, India"
          className="hidden cursor-help font-mono text-[13px] tracking-[0.06em] text-muted transition-colors hover:text-cream sm:block"
        >
          {config.location}
        </Previewable>
      </div>

      {/* big name */}
      <h1 className="font-display font-black uppercase leading-[0.88] tracking-[-0.045em] text-cream text-[clamp(44px,10.5vw,128px)]">
        Naman
        <br />
        <span>Parashar</span>
        <span className="text-green">.</span>
      </h1>

      {/* lower band */}
      <div className="flex flex-col items-start justify-between gap-8 pt-10 md:flex-row md:items-end md:gap-16">
        <div className="max-w-lg">
          <div className="mb-5 h-px w-10 bg-green" />
          <p className="text-base leading-relaxed text-muted-2 md:text-lg">
            {config.headline}
          </p>
        </div>
        <dl className="flex shrink-0 gap-8 sm:gap-12">
          {config.meta.map((m) => (
            <div key={m.label} className="flex flex-col gap-2.5">
              <dt className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                {m.label}
              </dt>
              <dd className="text-base font-semibold text-cream">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
