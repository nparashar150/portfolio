import { config } from "@/lib/config";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-[1240px] px-6 pt-28 md:px-10 lg:px-16"
    >
      <div className="flex items-end justify-between pb-10">
        <span className="font-mono text-xs tracking-[0.1em] text-green">
          03 / WHO&apos;S BEHIND THE KEYBOARD
        </span>
        <span className="hidden font-mono text-xs tracking-[0.04em] text-muted sm:block">
          [ PRODUCT-MINDED ENGINEER ]
        </span>
      </div>

      <div className="flex flex-col gap-12 md:flex-row md:gap-20">
        <Reveal className="flex-1">
          <p className="max-w-2xl font-display text-2xl font-medium leading-[1.34] tracking-[-0.02em] text-cream md:text-[30px]">
            {config.about}
          </p>
        </Reveal>
        <Reveal delay={0.1} className="w-full shrink-0 md:w-96">
          <span className="font-mono text-[12px] tracking-[0.1em] text-muted">
            WORKED WITH SO FAR
          </span>
          <div className="flex flex-wrap gap-2.5 pt-5">
            {config.skills.map((s) => (
              <span
                key={s}
                className={
                  s === "Voice AI"
                    ? "rounded-full bg-green px-3.5 py-1.5 text-sm font-medium text-green-deep"
                    : "rounded-full border border-line-3 px-3.5 py-1.5 text-sm font-medium text-cream"
                }
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
