import { Public_Sans } from "next/font/google";
import localFont from "next/font/local";

/**
 * The public site's type: Public Sans for text, Newsreader for headings. Each
 * is self-hosted and preloaded only on the routes that import this module,
 * so the learner and tutor areas never pay for them.
 *
 * Public Sans carries the naira sign (₦), which Google files under latin-ext:
 * that face downloads only on a page that shows a price.
 */
export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

/*
 * Newsreader is cut at one optical size, 48, the size of a section heading.
 * The design sets its headings at display optical sizes, which are narrower
 * and finer than the text cut Google serves without the axis. Taking the
 * whole axis would more than double the download (about 129KB against 57KB);
 * pinning it costs nothing extra. The files come from Google Fonts
 * (Newsreader:opsz,wght@48,500..600); see assets/README.md.
 *
 * Two faces, split as Google splits them: Latin, preloaded, and Latin
 * Extended, fetched only if a heading ever uses one of its characters.
 *
 * The font loader reads these options as written, so the ranges are spelled
 * out in place rather than shared.
 */

export const newsreader = localFont({
  src: "../../assets/fonts/newsreader-48-latin.woff2",
  weight: "500 600",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

/** No fallback of its own, so it never stands in for Latin it does not cover. */
export const newsreaderExtended = localFont({
  src: "../../assets/fonts/newsreader-48-latin-ext.woff2",
  weight: "500 600",
  style: "normal",
  variable: "--font-newsreader-ext",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF",
    },
  ],
});
