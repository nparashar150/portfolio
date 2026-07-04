import { ImageResponse } from "next/og";

export const alt = "Naman Parashar · Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CELLS = [
  "#0e4429",
  "#16201a",
  "#26a641",
  "#006d32",
  "#39d353",
  "#16201a",
  "#0e4429",
  "#26a641",
  "#006d32",
  "#16201a",
  "#39d353",
  "#0e4429",
  "#006d32",
  "#26a641",
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f4f1ea",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{ width: 14, height: 14, borderRadius: 99, background: "#22c55e" }}
          />
          <div style={{ fontSize: 24, color: "#8a8784", letterSpacing: 3 }}>
            OPEN TO WORK · VOICE AI
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -5 }}>
            Naman
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -5,
            }}
          >
            Parashar<span style={{ color: "#22c55e" }}>.</span>
          </div>
          <div style={{ fontSize: 30, color: "#b5b2ae", marginTop: 28, maxWidth: 820 }}>
            An engineer who likes building products. Loves UI, deep in voice AI.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 9 }}>
            {CELLS.map((c, i) => (
              <div
                key={i}
                style={{ width: 26, height: 26, borderRadius: 5, background: c }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 30, fontWeight: 800 }}>
            naman
            <div style={{ width: 14, height: 28, background: "#22c55e" }} />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
