// Controls for a live call should look like what they do. A glyph like "■"
// reads as "stop" in a media player, which is how people ended up hanging up
// when they meant to mute.
//
// Sizes are passed in rather than fixed: an icon that looks right at 40px is
// lost inside a 52px circle. Aim for roughly 40% of the circle.

export function MicIcon({
  muted = false,
  size = 22,
}: {
  muted?: boolean;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      {/* The slash is the whole message when muted, so it sits on top. */}
      {muted && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

export function HangUpIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* A handset tilted down — the universal "hang up", not a stop square. */}
      <g transform="rotate(135 12 12)">
        <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" />
      </g>
    </svg>
  );
}

export function PlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      {/* Nudged right: a triangle centred on its bounding box looks off-centre
          inside a circle, because its visual mass sits left of centre. */}
      <path d="M9 5.5v13l10.5-6.5z" />
    </svg>
  );
}
