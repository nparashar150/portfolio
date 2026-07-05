// matrix-style theme switch: a wave of commit cells sweeps across the page,
// the new theme is what it leaves behind
const PITCH = 26;
const CELL = 21;
const COVER_MS = 520;
const REVEAL_MS = 620;

let running = false;

const frac = (x: number) => x - Math.floor(x);
const jitter = (c: number, r: number) =>
  frac(Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233) * 43758.5453);

function readVars() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return {
    ink: v("--color-ink"),
    ramp: [0, 1, 2, 3, 4].map((i) => v(`--cell-${i}`)),
  };
}

export function themeSweep(apply: () => void) {
  if (running) return;
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    apply();
    return;
  }
  running = true;

  const old = readVars();

  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;z-index:180;pointer-events:none;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    apply();
    running = false;
    return;
  }
  ctx.scale(dpr, dpr);

  const cols = Math.ceil(w / PITCH);
  const rows = Math.ceil(h / PITCH);
  let applied = false;
  const start = performance.now();

  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);

    if (t >= COVER_MS && !applied) {
      applied = true;
      apply(); // page under the wave flips theme here
    }

    const cover = Math.min(1, t / COVER_MS);
    const reveal = applied
      ? Math.min(1, (t - COVER_MS) / REVEAL_MS)
      : 0;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const j = jitter(c, r);
        const tIn = (c / cols) * 0.72 + j * 0.28;
        const tOut = (c / cols) * 0.72 + j * 0.28;
        const covered = cover > tIn && !(applied && reveal > tOut);
        if (!covered) continue;

        const x = c * PITCH;
        const y = r * PITCH;
        // opaque backing so the mid-flip never peeks through the gaps
        ctx.fillStyle = old.ink;
        ctx.fillRect(x, y, PITCH, PITCH);

        // bright leading edge, dimmer body, matrix texture behind the front
        const nearIn = cover - tIn < 0.1;
        const nearOut = applied && tOut - reveal < 0.1;
        const level =
          nearIn || nearOut ? 4 : j > 0.86 ? 3 : j > 0.55 ? 2 : j > 0.2 ? 1 : 0;
        ctx.fillStyle = old.ramp[level];
        const pad = (PITCH - CELL) / 2;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, CELL, CELL, 4);
        ctx.fill();
      }
    }

    if (t < COVER_MS + REVEAL_MS) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
      running = false;
    }
  };

  requestAnimationFrame(tick);
}
