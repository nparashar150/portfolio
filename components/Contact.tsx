import { config } from "@/lib/config";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto mt-28 w-full max-w-[1240px] border-t border-line px-6 pt-24 md:px-10 lg:px-16"
    >
      <span className="font-mono text-xs tracking-[0.1em] text-green">
        04 / LET&apos;S CONNECT
      </span>

      <Reveal>
        <h2 className="relative pt-7 font-display text-5xl font-black leading-[0.94] tracking-[-0.04em] text-cream md:text-[76px]">
          Let&apos;s build
          <br />
          something good
          <span className="text-green">.</span>
        </h2>
      </Reveal>

      <p className="max-w-xl pt-8 text-lg leading-relaxed text-muted-2 md:text-xl">
        Open to work, collaborations, and good conversations.
      </p>

      <div className="flex flex-col justify-between gap-12 pt-16 pb-8 md:flex-row md:gap-20">
        <div className="flex flex-col gap-9">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[12px] tracking-[0.1em] text-muted">
              EMAIL
            </span>
            <a
              href={`mailto:${config.email}`}
              className="group inline-flex w-fit flex-col gap-2"
            >
              <span className="font-display text-xl font-semibold tracking-[-0.02em] text-cream break-all transition-colors group-hover:text-green sm:text-2xl md:text-[30px]">
                {config.email}
              </span>
              <span className="h-px w-full bg-line-3 transition-colors duration-300 group-hover:bg-green" />
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
            <span className="font-mono text-[13px] tracking-[0.04em] text-muted">
              USUALLY REPLIES WITHIN A DAY
            </span>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col md:w-[420px]">
          <span className="pb-2 font-mono text-[12px] tracking-[0.1em] text-muted">
            ELSEWHERE
          </span>
          {config.socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between border-b border-line py-[18px]"
            >
              <span className="text-lg font-medium text-cream transition-colors group-hover:text-green">
                {s.name}
              </span>
              <span className="font-mono text-sm text-muted">{s.handle} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
