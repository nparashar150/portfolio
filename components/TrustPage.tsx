import Link from "next/link";
import { config } from "@/lib/config";
import { TRUST_PAGES, type PageContent } from "@/lib/content";

// Shared, on-brand layout for the trust-anchor pages (/about, /contact, /privacy).
// Server-rendered prose — no client gating — so the content is in the raw HTML.
export function TrustPage({ content }: { content: PageContent }) {
  return (
    <main className="min-h-screen bg-ink">
      <article className="mx-auto w-full max-w-[820px] px-6 py-16 md:py-24">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.08em] text-muted transition-colors hover:text-green"
        >
          ← NAMAN PARASHAR
        </Link>

        <p className="pt-12 font-mono text-[13px] tracking-[0.1em] text-green">
          {content.label}
        </p>
        <h1 className="pt-4 font-display text-[44px] font-black leading-[0.95] tracking-[-0.03em] text-cream md:text-[68px]">
          {content.title}
        </h1>
        <p className="max-w-[640px] pt-6 text-lg leading-relaxed text-muted-2">
          {content.description}
        </p>

        <div className="flex flex-col gap-10 pt-14">
          {content.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-cream md:text-[26px]">
                {section.heading}
              </h2>
              {section.body.map((para, i) => (
                <p
                  key={i}
                  className="max-w-[640px] leading-relaxed text-muted-2"
                >
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <nav className="mt-16 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-8 font-mono text-xs tracking-[0.06em] text-muted">
          <Link href="/" className="transition-colors hover:text-green">
            HOME ↗
          </Link>
          {TRUST_PAGES.filter((p) => p.slug !== content.slug).map((p) => (
            <Link
              key={p.slug}
              href={p.path}
              className="transition-colors hover:text-green"
            >
              {p.slug.toUpperCase()} ↗
            </Link>
          ))}
          <a
            href={`mailto:${config.email}`}
            className="transition-colors hover:text-green"
          >
            EMAIL ↗
          </a>
        </nav>
      </article>
    </main>
  );
}
