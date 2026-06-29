import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="mx-auto mt-20 w-full max-w-[1240px] border-t border-line px-6 pt-16 pb-12 md:px-10 lg:px-16">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="flex flex-col gap-3.5">
          <Wordmark size={26} blink={false} />
          <span className="text-[15px] text-muted">
            Building AI-first web products from India, for the world.
          </span>
        </div>
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-full border border-line-3 px-5 py-3 transition-colors hover:border-green/50"
        >
          <span className="font-mono text-[13px] font-bold tracking-[0.04em] text-cream">
            BACK TO TOP
          </span>
          <span className="text-green">↑</span>
        </a>
      </div>

      {/* console easter egg */}
      <div className="mt-10 overflow-x-auto rounded-md border border-line bg-surface px-5 py-4">
        <code className="font-mono text-sm whitespace-nowrap">
