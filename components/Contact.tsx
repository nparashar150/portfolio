import { config } from "@/lib/config";
import { Reveal } from "./Reveal";
import { AgentConsole } from "./AgentConsole";

export function Contact() {
  return (
    <section
      id="contact"
      className="mx-auto w-full max-w-[1080px] overflow-hidden px-6 pt-32"
    >
      <span className="font-mono text-[13px] tracking-[0.1em] text-green">
        04 / SKIP THE EMAIL THREAD
      </span>

      <Reveal>
        <h2 className="pt-8 font-display font-black uppercase leading-[0.9] tracking-[-0.045em] text-cream whitespace-nowrap text-[clamp(52px,12vw,148px)]">
          Let&apos;s talk<span className="text-green">.</span>
        </h2>
      </Reveal>

      <p className="max-w-[560px] pt-7 text-lg leading-relaxed text-muted-2">
        Literally. Ask my agent anything about the work, then have it put 30
        minutes on my calendar while you&apos;re still talking. No form, no
        reply-all. The inbox still works if you prefer the old ways.
      </p>

      {/* the agent lives here now */}
      <div className="pt-12">
        <Reveal>
          <AgentConsole />
        </Reveal>
      </div>

      <div className="flex flex-col items-start justify-between gap-8 pt-16 pb-12 md:flex-row md:items-center">
        <a
          href={`mailto:${config.email}`}
          className="font-mono text-lg font-bold tracking-[-0.01em] text-cream underline underline-offset-8 transition-colors hover:text-green md:text-[22px]"
        >
          {config.email}
        </a>
        <div className="flex flex-wrap items-center gap-7">
          {config.socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[13px] tracking-[0.06em] text-muted transition-colors hover:text-green"
            >
              {s.name.toUpperCase()} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
