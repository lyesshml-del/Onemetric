import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "OneMetric — simple, affordable analytics for founders";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            height: 60,
            marginBottom: 32,
          }}
        >
          <div
            style={{ width: 18, height: 27, borderRadius: 5, backgroundColor: "#fafafa" }}
          />
          <div
            style={{ width: 18, height: 42, borderRadius: 5, backgroundColor: "#fafafa" }}
          />
          <div
            style={{ width: 18, height: 60, borderRadius: 5, backgroundColor: "#6e5dd8" }}
          />
        </div>
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          OneMetric
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Simple, affordable analytics for founders.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#a1a1aa" }}>
          Cookieless · events · funnels · revenue · weekly reports
        </div>
      </div>
    ),
    { ...size },
  );
}
