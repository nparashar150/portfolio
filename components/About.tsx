import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { PhotoCard } from "./PhotoCard";

const CARD =
  "rounded-2xl border border-line bg-surface shadow-[0_14px_50px_-26px_rgba(0,0,0,0.8)]";

export function About() {
  return (
    <section
      id="about"
      className="mx-auto w-full max-w-[1240px] px-6 pt-36 md:px-10 lg:px-16"
    >
      <div className="flex items-end justify-between pb-10">
        <span className="font-mono text-xs tracking-[0.1em] text-green">
          03 / WHO&apos;S BEHIND THE KEYBOARD
        </span>
        <span className="hidden font-mono text-xs tracking-[0.04em] text-muted sm:block">
          [ PRODUCT-MINDED ENGINEER ]
        </span>
      </div>

      <Reveal>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* photo */}
          <PhotoCard
            src={config.photo}
            className="min-h-[280px] md:col-span-2 md:row-span-2 md:min-h-0"
          />

          {/* statement + status */}
          <div
            className={`flex flex-col justify-center gap-6 p-7 md:col-span-4 md:p-10 ${CARD}`}
          >
            <p className="max-w-2xl font-display text-2xl font-medium leading-[1.34] tracking-[-0.02em] text-cream md:text-[30px]">
              {config.about}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
                <span className="font-mono text-[12px] tracking-[0.06em] text-cream">
                  OPEN TO WORK
                </span>
              </span>
              <span className="font-mono text-[12px] tracking-[0.04em] text-muted">
                RINGG AI · VOICE AI
              </span>
              <span className="font-mono text-[12px] tracking-[0.04em] text-muted">
                NEW DELHI · REMOTE
              </span>
            </div>
          </div>

          {/* skills */}
          <div className={`flex flex-col gap-5 p-7 md:col-span-4 md:p-8 ${CARD}`}>
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted">
              WORKED WITH SO FAR
            </span>
            <div className="flex flex-wrap gap-2.5">
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
          </div>
        </div>
      </Reveal>
    </section>
  );
}
