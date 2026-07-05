/* eslint-disable @next/next/no-img-element */
import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { Previewable } from "./preview/Previewable";

const STATS = ["100+ USERS", "45% FASTER", "2X ENGAGEMENT"];

function CellMark() {
  // waveform silhouette in commit cells, the site's atom
  const LEVELS = [1, 2, 4, 5, 3, 2, 5, 4, 2, 3, 4, 2, 1];
  return (
    <div className="grid gap-[4px]" style={{ gridTemplateColumns: "repeat(13, 13px)" }} aria-hidden>
      {Array.from({ length: 13 * 5 }).map((_, i) => {
        const col = i % 13;
        const row = Math.floor(i / 13);
        const level = LEVELS[col];
        const up = Math.floor((level - 1) / 2);
        const down = Math.ceil((level - 1) / 2);
        const d = row - 2;
        const lit = d >= -up && d <= down;
        const color = !lit
          ? "#0e2c1a"
          : Math.abs(d) === 0
            ? "#31ff7a"
            : Math.abs(d) === 1
              ? "#16a34a"
              : "#15803d";
        return (
          <span key={i} className="h-[13px] w-[13px] rounded-[3px]" style={{ backgroundColor: color }} />
        );
      })}
    </div>
  );
}

export function Projects() {
  const f = config.featured;
  return (
    <section id="projects" className="mx-auto w-full max-w-[1080px] px-6 pt-32">
      <div className="flex items-end justify-between pb-10">
        <span className="font-mono text-[13px] tracking-[0.1em] text-green">
          02 / THINGS I&apos;VE BUILT
        </span>
        <span className="hidden font-mono text-xs tracking-[0.05em] text-muted sm:block">
          [ DRAG SIDEWAYS → ]
        </span>
      </div>

      {/* featured */}
      <Reveal>
        <Previewable
          href={f.url}
          target="_blank"
          preview={f.preview}
          label={f.name}
          embed={f.embed}
          className="group flex flex-col overflow-hidden border border-line bg-surface md:flex-row"
        >
          <div className="flex flex-1 flex-col justify-between gap-14 p-8 md:p-11">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-[0.08em] text-muted">
                FEATURED / 01
              </span>
              <span className="flex items-center gap-2 rounded-full border border-[#2b4a36] px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                <span className="font-mono text-[11px] font-bold tracking-[0.08em] text-cream">
                  {f.tag.toUpperCase()}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-display text-[56px] font-black lowercase leading-[0.92] tracking-[-0.04em] text-green md:text-[100px]">
                {f.display}
              </span>
              <p className="max-w-md text-[16px] leading-relaxed text-muted-2">
                {f.name} turns long-form video into captioned shorts for Reels,
                TikTok and Shorts. Built it end to end.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {f.tech.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="border border-line px-3 py-1.5 font-mono text-xs text-muted"
                >
                  {t.toUpperCase()}
                </span>
              ))}
              <span className="px-1 font-mono text-xs font-bold text-green transition-transform group-hover:translate-x-1">
                {f.host.toUpperCase()} ↗
              </span>
            </div>
          </div>
          <div className="flex w-full items-center justify-center border-t border-line bg-surface-2 p-7 md:w-[44%] md:border-t-0 md:border-l">
            <img
              src={f.preview}
              alt={f.name}
              className="w-full max-w-[460px] object-contain"
            />
          </div>
        </Previewable>
      </Reveal>

      {/* drag strip */}
      <Reveal>
        <div className="scrollbar-none -mx-6 mt-5 flex snap-x gap-5 overflow-x-auto px-6 pb-2">
          {config.projects.map((p, i) => (
            <Previewable
              key={p.name}
              href={p.url}
              target="_blank"
              preview={p.preview}
              label={p.name}
              embed={p.embed}
              className="group flex w-[330px] shrink-0 snap-start flex-col border border-line bg-surface transition-colors hover:border-green/40 md:w-[390px]"
            >
              <div className="border-b border-line bg-surface-2 p-3.5">
                <img
                  src={p.preview}
                  alt={p.name}
                  className="h-[190px] w-full object-cover object-top md:h-[219px]"
                />
              </div>
              <div className="flex flex-col gap-2.5 p-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[26px] font-black tracking-[-0.02em] text-cream md:text-[30px]">
                    {p.name}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.06em] text-green">
                    {STATS[i]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
              </div>
            </Previewable>
          ))}
          {/* more card, peeks from the edge */}
          <a
            href={config.socials[0].url}
            target="_blank"
            rel="noreferrer"
            className="group flex w-[330px] shrink-0 snap-start flex-col border border-line bg-surface transition-colors hover:border-green/40 md:w-[390px]"
          >
            <div className="flex h-[217px] items-center justify-center border-b border-line bg-surface-2 md:h-[247px]">
              <CellMark />
            </div>
            <div className="flex flex-col gap-2.5 p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[26px] font-black tracking-[-0.02em] text-cream md:text-[30px]">
                  More <span className="text-green">→</span>
                </span>
                <span className="font-mono text-[11px] tracking-[0.06em] text-green">
                  GITHUB
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Experiments, tools and shipped weirdness. @nparashar150.
              </p>
            </div>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
