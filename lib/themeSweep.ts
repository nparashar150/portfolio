// theme switch: the new theme radiates out from the toggle button as an
// expanding circle (view transition), with a sparse glitch of commit cells
// riding the wavefront
const DURATION = 750;
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

let running = false;

type VT = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => VT };

function readRamp() {
  const s = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4].map((i) => s.getPropertyValue(`--cell-${i}`).trim());
}

// short-lived cells sprinkled just inside the expanding edge
function glitchCells(x: number, y: number, maxR: number) {
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
    return;
  }
  ctx.scale(dpr, dpr);

  const ramp = readRamp();
  const cells: { x: number; y: number; born: number; ttl: number; c: string; s: number }[] = [];
  const start = performance.now();

  const tick = (now: number) => {
    const t = (now - start) / DURATION;
    ctx.clearRect(0, 0, w, h);

    if (t < 1) {
      // eased radius matching the clip-path circle
      const p = 1 - Math.pow(1 - Math.min(1, t), 3);
      const R = maxR * p;
      // spawn a handful of cells just inside the edge each frame
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = R - Math.random() * 90;
        if (r < 0) continue;
        const cx = x + Math.cos(a) * r;
        const cy = y + Math.sin(a) * r;
        if (cx < -20 || cx > w + 20 || cy < -20 || cy > h + 20) continue;
        cells.push({
          x: Math.round(cx / 22) * 22,
          y: Math.round(cy / 22) * 22,
          born: now,
          ttl: 140 + Math.random() * 260,
          c: ramp[Math.random() > 0.6 ? 3 : Math.floor(Math.random() * 3)],
          s: Math.random() > 0.85 ? 16 : 10,
        });
      }
    }

    let alive = false;
    for (const cell of cells) {
      const age = (now - cell.born) / cell.ttl;
      if (age >= 1) continue;
      alive = true;
      ctx.globalAlpha = (1 - age) * 0.85;
      ctx.fillStyle = cell.c;
      ctx.beginPath();
      ctx.roundRect(cell.x, cell.y, cell.s, cell.s, 3);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (t < 1 || alive) requestAnimationFrame(tick);
    else canvas.remove();
  };

  requestAnimationFrame(tick);
}

// mini firework of commit cells thrown off the button, every click gets one
let bursts = 0;
export function sparkleBurst(x: number, y: number) {
  if (bursts >= 5) return; // spam-friendly, but not infinite canvases
  bursts++;

  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;z-index:185;pointer-events:none;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    bursts--;
    return;
  }
  ctx.scale(dpr, dpr);

  const ramp = readRamp();
  // fountain aimed at the viewport center so corner buttons spray into view
  const aim = Math.atan2(h / 2 - y, w / 2 - x);
  const parts = Array.from({ length: 42 }, () => {
    const a = aim + (Math.random() - 0.5) * 2.6;
    const v = 220 + Math.random() * 520;
    return {
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 60,
      s: Math.random() > 0.7 ? 16 : Math.random() > 0.4 ? 12 : 8,
      c: ramp[Math.random() > 0.4 ? 3 : 1 + Math.floor(Math.random() * 2)],
      ttl: 600 + Math.random() * 400,
      spin: (Math.random() - 0.5) * 7,
    };
  });
  const start = performance.now();

  const tick = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    for (const p of parts) {
      const life = t / p.ttl;
      if (life >= 1) continue;
      alive = true;
      const sec = t / 1000;
      const px = x + p.vx * sec;
      const py = y + p.vy * sec + 380 * sec * sec; // gravity
      ctx.save();
      ctx.globalAlpha = 1 - life;
      ctx.translate(px, py);
      ctx.rotate(p.spin * sec);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.roundRect(-p.s / 2, -p.s / 2, p.s, p.s, 2.5);
      ctx.fill();
      ctx.restore();
    }
    if (alive) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
      bursts--;
    }
  };

  requestAnimationFrame(tick);
}

export function themeSweep(apply: () => void, origin?: { x: number; y: number }) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // every click throws cells off the button, even mid-transition spam
  if (!reduced && origin) sparkleBurst(origin.x, origin.y);

  if (running) return;
  const doc = document as DocWithVT;

  if (reduced || !doc.startViewTransition) {
    apply();
    return;
  }
  running = true;

  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 40;
  const maxR = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const vt = doc.startViewTransition(apply);
  vt.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxR}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: DURATION,
          easing: EASE,
          pseudoElement: "::view-transition-new(root)",
        },
      );
      glitchCells(x, y, maxR);
    })
    .catch(() => {});
  vt.finished.finally(() => {
    running = false;
  });
}
