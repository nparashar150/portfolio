import { config } from "@/lib/config";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto w-full max-w-[1240px] px-6 pt-12 pb-10 md:px-10 lg:px-16 lg:pt-20"
    >
      {/* eyebrow */}
      <div className="flex items-center justify-between pb-10 md:pb-12">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
          <span className="font-mono text-[13px] tracking-[0.06em] text-cream">
            {config.status.toUpperCase()}
          </span>
        </div>
        <span className="hidden font-mono text-[13px] tracking-[0.06em] text-muted sm:block">
