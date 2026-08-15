import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Mitram — Relive. Connect. Celebrate Life.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/images/brand/logo-full.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#FFFDF5",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(245,166,35,0.25), transparent 45%), radial-gradient(circle at 8% 90%, rgba(139,26,26,0.18), transparent 45%)",
        fontFamily: "sans-serif",
      }}
    >
      <img src={logoSrc} alt="Mitram" width={168} height={112} />

      <div
        style={{
          marginTop: 56,
          fontSize: 68,
          fontWeight: 800,
          color: "#1A1A1A",
          lineHeight: 1.08,
          maxWidth: 980,
        }}
      >
        Relive. Connect. Celebrate Life.
      </div>

      <div
        style={{
          marginTop: 28,
          fontSize: 30,
          color: "#4A4A4A",
          lineHeight: 1.4,
          maxWidth: 900,
        }}
      >
        Senior travel made easier — verified companions, thoughtful support and
        live family updates.
      </div>
    </div>,
    { ...size },
  );
}
