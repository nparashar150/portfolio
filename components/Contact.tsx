import { config } from "@/lib/config";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="w-full overflow-hidden border-t border-line px-6 pt-32 md:px-12"
    >
      <span className="font-mono text-[13px] tracking-[0.1em] text-green">
        04 / SAY IT OUT LOUD
      </span>

      <Reveal>
        <h2 className="pt-8 font-display font-black uppercase leading-[0.9] tracking-[-0.045em] text-cream whitespace-nowrap text-[clamp(64px,13vw,190px)]">
          Let&apos;s talk<span className="text-green">.</span>
        </h2>
      </Reveal>

      <p className="max-w-[560px] pt-7 text-lg leading-relaxed text-muted-2">
        Literally. The agent is listening. Or if you prefer the old ways, the
        inbox works too.
      </p>

      <div className="flex flex-col items-start justify-between gap-8 pt-14 pb-12 md:flex-row md:items-center">
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
