import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/logo";

/**
 * The share image for the home page and for any event without its own.
 * Rendered once at build. The font is a 5KB subset holding only the glyphs
 * below; change the words and regenerate it (see assets/README.md).
 */

export const alt = "Antitect: learning should lead to the ability to do.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const archivo = await readFile(join(process.cwd(), "assets/archivo-800-subset.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FEFEFE",
          color: "#0A0A0A",
          padding: "72px 80px",
          fontFamily: "Archivo",
        }}
      >
        <svg viewBox={LOGO_VIEWBOX} width={124} height={68}>
          <path fill="#0A0A0A" d={LOGO_PATHS.a} />
          <path fill="#CE1115" d={LOGO_PATHS.t} />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
            maxWidth: 940,
          }}
        >
          Learning should lead to the ability to do.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
          <span>antitect.org</span>
          <span style={{ color: "#5A5A5A" }}>Free webinars and programmes</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Archivo", data: archivo, style: "normal", weight: 800 }],
    },
  );
}
