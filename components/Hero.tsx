import { config } from "@/lib/config";
import { Previewable } from "./preview/Previewable";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto w-full max-w-[1240px] px-6 pt-12 pb-10 md:px-10 lg:px-16 lg:pt-20"
    >
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
