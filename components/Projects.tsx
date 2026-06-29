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
