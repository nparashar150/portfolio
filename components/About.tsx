import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { PhotoCard } from "./PhotoCard";

export function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-[1080px] px-6 pt-32">
      <div className="flex items-end justify-between pb-10">
        <span className="font-mono text-[13px] tracking-[0.1em] text-green">
          03 / THE HUMAN BEHIND THE AGENT
        </span>
        <span className="hidden font-mono text-xs tracking-[0.05em] text-muted sm:block">
          ASK THE AGENT ABOUT ME. IT KNOWS
        </span>
      </div>

      <Reveal>
        <div className="flex flex-col gap-5 md:flex-row">
          <PhotoCard
            src={config.photo}
            className="h-[420px] w-full shrink-0 md:h-[440px] md:w-[380px]"
          />
          <div className="flex flex-1 flex-col justify-between gap-10 border border-line bg-surface p-8 md:p-10">
            <p className="max-w-3xl font-display text-[26px] font-medium leading-[1.35] tracking-[-0.015em] text-cream md:text-[34px]">
              {config.about}
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2.5">
                {config.skills.map((s) => (
                  <span
                    key={s}
                    className={
                      s === "Voice AI"
                        ? "rounded-full bg-green px-3.5 py-1.5 font-mono text-xs font-bold text-green-deep"
                        : "rounded-full border border-line-3 px-3.5 py-1.5 font-mono text-xs text-cream"
                    }
                  >
                    {s.toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs tracking-[0.05em] text-muted">
                CURRENTLY: RINGG AI · PREVIOUSLY: SYLVA, ANTLER, CAREFI ·
                ALWAYS: SHIPPING
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
