import { config } from "@/lib/config";
import { Reveal } from "./Reveal";

export function Work() {
  return (
    <section
      id="work"
      className="mx-auto w-full max-w-[1240px] px-6 pt-28 md:px-10 lg:px-16"
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
