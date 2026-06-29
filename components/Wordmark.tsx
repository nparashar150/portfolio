export function Wordmark({
  size = 23,
  blink = true,
}: {
  size?: number;
  blink?: boolean;
}) {
  return (
    <span className="flex items-center gap-1 select-none">
      <span
        className="font-display font-extrabold tracking-[-0.04em] text-cream"
        style={{ fontSize: size }}
