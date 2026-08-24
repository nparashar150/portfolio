import Link from "next/link";
import { TRUST_PAGES } from "@/lib/content";

// Root not-found: handles unmatched URLs across the app and any notFound() call.
// Returns a real 404 (non-streamed) with a short, navigable body so both people
// and agents can recover instead of hitting a dead end.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-ink">
      <div className="mx-auto w-full max-w-[820px] px-6 py-24">
        <p className="font-mono text-[13px] tracking-[0.1em] text-green">
          404 / NOT FOUND
        </p>
        <h1 className="pt-4 font-display text-[52px] font-black leading-[0.95] tracking-[-0.03em] text-cream md:text-[80px]">
          Nothing here.
        </h1>
        <p className="max-w-[560px] pt-6 text-lg leading-relaxed text-muted-2">
          That page doesn&apos;t exist. Here&apos;s where to go instead — the
          links below cover the whole site.
        </p>

        <nav className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-8 font-mono text-xs tracking-[0.06em] text-muted">
          <Link href="/" className="transition-colors hover:text-green">
            HOME ↗
          </Link>
          {TRUST_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={p.path}
              className="transition-colors hover:text-green"
            >
              {p.slug.toUpperCase()} ↗
            </Link>
          ))}
          <a href="/llms.txt" className="transition-colors hover:text-green">
            LLMS.TXT ↗
          </a>
          <a href="/sitemap.xml" className="transition-colors hover:text-green">
            SITEMAP ↗
          </a>
        </nav>
      </div>
    </main>
  );
}
