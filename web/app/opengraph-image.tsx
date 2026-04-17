import { ImageResponse } from "next/og";

export const alt = "VideoToSMPL — video to humanoid motion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1e1b4b 100%)",
          padding: "80px",
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 2,
            color: "#818cf8",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          VideoToSMPL
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 980,
            marginBottom: 28,
          }}
        >
          Turn any video into humanoid motion
        </div>
        <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: 900 }}>
          Open pipeline · GVHMR + GMR + Unitree G1 · Free Colab or your own GPU
        </div>
      </div>
    ),
    size,
  );
}
