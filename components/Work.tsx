import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { Previewable } from "./preview/Previewable";

// text-roll hover: cream label slides up, green copy rolls in from below
function RollingName({ name }: { name: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:-translate-y-full">
        {name}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full text-green transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:translate-y-0"
      >
        {name}
      </span>
    </span>
  );
}

export function Work() {
  return (
    <section id="work" className="mx-auto w-full max-w-[1080px] px-6 pt-32">
      <div className="flex items-end justify-between pb-10">
        <span className="font-mono text-[13px] tracking-[0.1em] text-green">
          01 / WHERE I&apos;VE SHIPPED
        </span>
        <span className="hidden font-mono text-xs tracking-[0.05em] text-muted sm:block">
          HOVER A ROW. THE SITE SHOWS YOU
        </span>
      </div>

      <div className="flex flex-col">
        {config.work.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.05}>
            <Previewable
              href={job.url}
              target="_blank"
              preview={job.preview}
              label={job.company}
              embed={job.embed}
              className="group flex flex-col gap-3 border-t border-line py-8 md:flex-row md:items-baseline md:gap-10 md:py-9"
            >
              <span className="w-14 shrink-0 font-mono text-sm text-muted">
                /{(i + 1).toString().padStart(2, "0")}
              </span>
              <h3 className="flex-grow font-display text-[44px] font-black uppercase leading-none tracking-[-0.03em] text-cream md:text-[76px]">
                <RollingName name={job.company} />
              </h3>
              <div className="flex shrink-0 flex-col gap-1 md:items-end">
                <span className="font-mono text-xs font-bold tracking-[0.08em] text-green">
                  {job.role.toUpperCase()}
                </span>
                <span className="font-mono text-xs tracking-[0.05em] text-muted">
                  {job.period} · {job.stat}
                </span>
              </div>
            </Previewable>
          </Reveal>
        ))}
        <div className="border-t border-line" />
      </div>
    </section>
  );
}
