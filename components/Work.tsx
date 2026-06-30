import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { Previewable } from "./preview/Previewable";

export function Work() {
  return (
    <section
      id="work"
      className="mx-auto w-full max-w-[1240px] px-6 pt-36 md:px-10 lg:px-16"
    >
      <div className="flex items-end justify-between border-b border-line-3 pb-8">
        <div className="flex flex-col gap-3.5">
          <span className="font-mono text-xs tracking-[0.1em] text-green">
            01 / WHERE I&apos;VE WORKED
          </span>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-cream md:text-5xl">
            Selected Work
          </h2>
        </div>
        <span className="hidden font-mono text-[13px] tracking-[0.04em] text-muted sm:block">
          [ {config.work.length.toString().padStart(2, "0")} ROLES ]
        </span>
      </div>

      <div>
        {config.work.map((job, i) => (
          <Reveal key={job.company} delay={i * 0.05}>
            <Previewable
              href={job.url}
              target="_blank"
              preview={job.preview}
              label={job.company}
              className="group flex flex-col gap-3 border-b border-line py-7 md:flex-row md:items-center md:gap-10"
            >
              <span className="w-28 shrink-0 font-mono text-[13px] tracking-[0.04em] text-muted">
                {job.period}
              </span>
              <h3 className="w-full shrink-0 font-display text-[24px] font-bold tracking-[-0.02em] text-cream transition-colors group-hover:text-green md:w-60 md:text-[28px]">
                {job.company}
              </h3>
              <div className="flex flex-1 flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold tracking-[0.06em] text-green">
                  {job.role.toUpperCase()}
                </span>
                <p className="max-w-xl text-[15px] leading-relaxed text-muted-2">
                  {job.desc}
                </p>
              </div>
              <span className="hidden shrink-0 text-xl text-muted transition-all group-hover:translate-x-1 group-hover:text-cream md:block">
                ↗
              </span>
            </Previewable>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
