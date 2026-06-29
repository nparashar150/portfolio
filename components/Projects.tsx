import { config } from "@/lib/config";
import { Reveal } from "./Reveal";

export function Projects() {
  const f = config.featured;
  return (
    <section
      id="projects"
      className="mx-auto w-full max-w-[1240px] px-6 pt-28 md:px-10 lg:px-16"
    >
      <div className="flex items-end justify-between pb-8">
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-xs tracking-[0.1em] text-green">
            02 / THINGS I&apos;VE BUILT
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-cream md:text-5xl">
            Selected Projects
          </h2>
        </div>
        <span className="hidden font-mono text-[13px] tracking-[0.04em] text-muted sm:block">
          [ SHIP OFTEN ]
        </span>
      </div>

      {/* featured */}
      <Reveal>
        <a
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="group flex flex-col overflow-hidden rounded-lg border border-line-2 bg-surface md:flex-row"
        >
          <div className="flex flex-1 flex-col justify-between gap-10 p-8 md:p-10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] tracking-[0.06em] text-muted">
                FEATURED / 01
              </span>
              <span className="flex items-center gap-2 rounded-full border border-line-3 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-cream">
                  {f.tag.toUpperCase()}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-cream">
                {f.name}
              </h3>
              <p className="max-w-md text-[15px] leading-relaxed text-muted-2">
                {f.desc}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {f.tech.map((t) => (
                <span
                  key={t}
                  className="rounded border border-line-2 px-2.5 py-1.5 font-mono text-[12px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col justify-end gap-3 border-t border-l-0 border-[#1f3a2c] bg-[#0d1410] p-8 md:w-[44%] md:border-t-0 md:border-l">
            <span className="font-display text-5xl font-black tracking-[-0.05em] text-green md:text-6xl">
              {f.display}
            </span>
            <span className="font-mono text-[13px] font-bold tracking-[0.04em] text-[#5a8a6e] transition-transform group-hover:translate-x-1">
              {f.host.toUpperCase()} ↗
            </span>
          </div>
        </a>
      </Reveal>

      {/* grid */}
      <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-3">
        {config.projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.06}>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col justify-between gap-7 rounded-lg border border-line-2 bg-surface p-8 transition-colors hover:border-green/40"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[13px] tracking-[0.06em] text-muted">
                  {(i + 2).toString().padStart(2, "0")}
                </span>
                <span className="rounded-full border border-line-3 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.06em] text-green">
                  {p.tag.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col gap-3.5">
                <h3 className="font-display text-[26px] font-extrabold tracking-[-0.02em] text-cream">
                  {p.name}
                </h3>
