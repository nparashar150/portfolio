import { Previewable } from "./preview/Previewable";

export function Footer() {
  return (
    <footer className="w-full border-t border-line px-6 md:px-12">
      {/* console easter egg */}
      <div className="overflow-x-auto py-6">
        <code className="font-mono text-[13px] whitespace-nowrap">
          <span className="text-muted">console.</span>
          <span className="text-cream">log</span>
          <span className="text-muted">(</span>
          <span className="text-green">
            &quot;psst, you scrolled the whole thing. let&apos;s build something
            together → nparashar150@gmail.com&quot;
          </span>
          <span className="text-muted">)</span>
        </code>
      </div>

      <div className="flex flex-col gap-3 border-t border-line py-6 font-mono text-[11px] tracking-[0.06em] text-muted md:flex-row md:items-center md:justify-between">
        <span>© 2026 NAMAN PARASHAR · BUILT LOUD IN DELHI</span>
        <span className="flex items-center gap-2.5">
          <Previewable
            kind="map"
            label="New Delhi, India"
            className="cursor-help transition-colors hover:text-cream"
          >
            28.70°N 77.42°E
          </Previewable>
          <span>· 1,204 COMMITS THIS YEAR · THE SITE TALKS BACK</span>
        </span>
      </div>
    </footer>
  );
}
