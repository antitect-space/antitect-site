import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/logo-paths";
import { getImageSize } from "@/lib/api";
import { summarise } from "@/lib/format";

/**
 * The link-preview image for a webinar, workshop or programme (design W10,
 * and "Share image · With flyer"), drawn for each one by its route's
 * opengraph-image.tsx. WhatsApp shows this in the chat when a link is shared.
 *
 * Never a price: previews are cached long after a price changes, so the
 * format, the title and when it is are all it carries. With a flyer the flyer
 * sits on the right, whole, at its own shape.
 *
 * The share-image renderer reads TrueType fonts, not the WOFF2 the pages use,
 * so it has copies of its own in assets/fonts (see assets/README.md). They
 * stay on the server.
 */

export const SHARE_SIZE = { width: 1200, height: 630 } as const;

export interface ShareCard {
  /** "Free webinar", "Workshop", "Capability development programme". */
  label: string;
  title: string;
  /** "Saturday, 17 October 2026 · 10:00 am WAT"; null when there is no date yet. */
  when: string | null;
  flyer?: ShareFlyer | null;
}

export interface ShareFlyer {
  url: string;
  width: number;
  height: number;
}

const PAPER = "#FEFEFE";
const INK = "#0A0A0A";
const INK_MUTED = "#5A5A5A";
const RULE = "#E5E5E5";
const BRAND = "#CE1115";

const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/public-sans-500.ttf")),
  readFile(join(process.cwd(), "assets/fonts/newsreader-48-600.ttf")),
  readFile(join(process.cwd(), "assets/fonts/archivo-800-wordmark.ttf")),
]);

/**
 * A flyer the renderer can draw, at its own shape, or null. The renderer
 * reads JPEG, PNG and GIF; a Cloudinary upload in another format is asked for
 * as a JPEG, and anything else leaves the preview without a flyer rather than
 * failing it.
 */
export async function flyerForShare(imageUrl: string | null): Promise<ShareFlyer | null> {
  if (!imageUrl) return null;
  const size = await getImageSize(imageUrl);
  if (!size) return null;

  if (size.format === "jpeg" || size.format === "png" || size.format === "gif") {
    return { url: imageUrl, width: size.width, height: size.height };
  }
  const cloudinary = imageUrl.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  return cloudinary ? { url: `${cloudinary[1]}f_jpg/${cloudinary[2]}`, width: size.width, height: size.height } : null;
}

export async function renderShareImage(card: ShareCard): Promise<ImageResponse> {
  const [publicSans, newsreader, wordmark] = await fonts;

  return new ImageResponse(card.flyer ? <WithFlyer card={card} flyer={card.flyer} /> : <Plain card={card} />, {
    ...SHARE_SIZE,
    fonts: [
      { name: "Public Sans", data: publicSans, style: "normal", weight: 500 },
      { name: "Newsreader", data: newsreader, style: "normal", weight: 600 },
      { name: "Archivo", data: wordmark, style: "normal", weight: 800 },
    ],
  });
}

/** Without a flyer: the facts on paper, and two of Home B's rings behind them. */
function Plain({ card }: { card: ShareCard }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 72px 72px",
        background: PAPER,
        fontFamily: "Public Sans",
      }}
    >
      <Ring left={716} top={-73} size={776} />
      <Ring left={796} top={7} size={616} />
      <Lockup />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 900 }}>
        <div style={{ fontSize: 26, lineHeight: 1.3, color: INK_MUTED }}>{card.label}</div>
        <div
          style={{
            fontFamily: "Newsreader",
            fontSize: 64,
            lineHeight: 1.06,
            letterSpacing: -0.64,
            color: INK,
          }}
        >
          {summarise(card.title, 90)}
        </div>
        {card.when ? <div style={{ fontSize: 30, lineHeight: 1.3, color: INK }}>{card.when}</div> : null}
      </div>
    </div>
  );
}

/** With a flyer: the facts on the left, the flyer whole on the right, up to 560 × 534. */
function WithFlyer({ card, flyer }: { card: ShareCard; flyer: ShareFlyer }) {
  const scale = Math.min(560 / flyer.width, 534 / flyer.height);
  const width = Math.round(flyer.width * scale);
  const height = Math.round(flyer.height * scale);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 48,
        padding: 48,
        background: PAPER,
        fontFamily: "Public Sans",
      }}
    >
      <div
        style={{
          flex: 1,
          height: 534,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Lockup />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 26, lineHeight: 1.3, color: INK_MUTED }}>{card.label}</div>
          <div style={{ fontFamily: "Newsreader", fontSize: 56, lineHeight: 1.06, letterSpacing: -0.56, color: INK }}>
            {summarise(card.title, 56)}
          </div>
          {card.when ? <div style={{ fontSize: 28, lineHeight: 1.3, color: INK }}>{card.when}</div> : null}
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- drawn into the image, not served as a page element */}
      <img src={flyer.url} alt="" width={width} height={height} style={{ border: `1px solid ${RULE}` }} />
    </div>
  );
}

function Lockup() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg viewBox={LOGO_VIEWBOX} width={65.91} height={36}>
        <path fill={INK} d={LOGO_PATHS.a} />
        <path fill={BRAND} d={LOGO_PATHS.t} />
      </svg>
      <div style={{ fontFamily: "Archivo", fontSize: 19.8, letterSpacing: 3.56, color: INK }}>ANTITECT</div>
    </div>
  );
}

function Ring({ left, top, size }: { left: number; top: number; size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: size,
        border: `2px solid ${RULE}`,
      }}
    />
  );
}
