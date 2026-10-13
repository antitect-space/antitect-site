import Image from "next/image";

/**
 * The desktop hero's rings and logo badges (design B4 and B5), placed from
 * the design's "Ring layout · Home B". Coordinates are in the 1440px hero,
 * measured from its top: five concentric 1px rings round (720, 452), 80px
 * apart, and ten badges centred on the two outer rings, zigzagging down the
 * sides. On load the badges fade in and rise 6px, top to bottom and
 * alternating sides, 50ms apart (CSS only, see globals.css); after that,
 * nothing here moves.
 *
 * The layer is drawn at the design's size and centred, so at any width the
 * rings keep their place around the centred content and are clipped by the
 * hero's edges. Narrower than the design, a badge that would reach the edge
 * keeps its height in the zigzag and steps in to the next ring, so it is
 * always on a ring line. Each badge is placed for a few widths here, and the
 * hero picks one by container query (globals.css). Below 1160px there is no
 * room left beside the headline, and the badges are not shown; they are lazy
 * images in a hidden layer, so a phone never downloads them.
 */

const WIDTH = 1440;
const HEIGHT = 1271;
const CENTRE = { x: 720, y: 452 } as const;
const RADII = [308, 388, 468, 548, 628] as const;

/** Half a badge, and the least room left between a badge and the hero's edge. */
const HALF = 24;
const EDGE = 24;

/** The narrowest hero width of each placement: the design's own, then three narrower. */
const BANDS = [1336, 1280, 1200, 1160] as const;

interface Badge {
  tool: string;
  file: string;
  /** The logo's box inside the 48px badge, sized for equal visual weight. */
  size: number;
  x: number;
  y: number;
  ring: (typeof RADII)[number];
}

/** In load order: top to bottom, alternating sides, right first. */
export const BADGES: readonly Badge[] = [
  { tool: "Zapier", file: "zapier.png", size: 23, x: 1247.9, y: 111.9, ring: 628 },
  { tool: "Gmail", file: "gmail.png", size: 29, x: 144.8, y: 200, ring: 628 },
  { tool: "Google Sheets", file: "google-sheets.png", size: 29, x: 1242.9, y: 288.1, ring: 548 },
  { tool: "Notion", file: "notion.png", size: 29, x: 177.3, y: 376.3, ring: 548 },
  { tool: "n8n", file: "n8n.png", size: 43, x: 1347.9, y: 464.4, ring: 628 },
  { tool: "Instagram", file: "instagram.png", size: 23, x: 100.1, y: 552.5, ring: 628 },
  { tool: "Paystack", file: "paystack.png", size: 31, x: 1234.5, y: 640.6, ring: 548 },
  { tool: "Make", file: "make.png", size: 37, x: 247, y: 728.8, ring: 548 },
  { tool: "TikTok", file: "tiktok.png", size: 26, x: 1231.1, y: 816.9, ring: 628 },
  { tool: "YouTube", file: "youtube.png", size: 30, x: 285.1, y: 905, ring: 628 },
];

/**
 * Where a badge's centre sits in a hero `width` wide: where the design put
 * it, or, if that is too near the edge, at the same height on the next ring
 * in. Checked from 1160px up: badges stay at least 128px apart, and at least
 * 51px from the headline, the lead, the buttons, the card and the strip.
 */
function place(badge: Badge, width: number): { x: number; y: number } {
  const reach = width / 2 - HALF - EDGE;
  const side = Math.sign(badge.x - CENTRE.x);
  const rise = badge.y - CENTRE.y;
  let ring: number = badge.ring;
  let across = Math.abs(badge.x - CENTRE.x);

  while (across > reach && ring - 80 > Math.abs(rise)) {
    ring -= 80;
    across = Math.sqrt(ring * ring - rise * rise);
  }
  return { x: CENTRE.x + side * across, y: badge.y };
}

/** Each band's position as custom properties, read by globals.css. */
function positions(badge: Badge): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const band of BANDS) {
    const { x, y } = place(badge, band);
    vars[`--x-${band}`] = `${(x - HALF).toFixed(1)}px`;
    vars[`--y-${band}`] = `${(y - HALF).toFixed(1)}px`;
  }
  return vars;
}

export function Orbit() {
  return (
    <div
      className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 max-lg:hidden"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <svg
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 text-rule"
      >
        {RADII.map((radius) => (
          <circle key={radius} cx={CENTRE.x} cy={CENTRE.y} r={radius} fill="none" stroke="currentColor" strokeWidth={1} />
        ))}
      </svg>

      <div data-badges="">
        {BADGES.map((badge, index) => (
          <span
            key={badge.tool}
            data-badge=""
            className="absolute flex size-12 items-center justify-center overflow-hidden rounded-full border border-rule bg-paper"
            style={{ ...positions(badge), "--badge": index } as React.CSSProperties}
          >
            <Image
              src={`/logos/${badge.file}`}
              alt={badge.tool}
              width={badge.size}
              height={badge.size}
              className="object-contain"
              style={{ width: badge.size, height: badge.size }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The phone's version (design B4, mobile): three faint rings, centred behind
 * the hero's card a little below its middle, clipped by the hero's edges.
 */
export function OrbitSmall() {
  return (
    <svg
      viewBox="0 0 1160 1160"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-[56%] left-1/2 -z-10 size-[1160px] -translate-x-1/2 -translate-y-1/2 text-rule lg:hidden"
    >
      {[340, 460, 580].map((radius) => (
        <circle key={radius} cx={580} cy={580} r={radius - 0.5} fill="none" stroke="currentColor" strokeWidth={1} />
      ))}
    </svg>
  );
}
