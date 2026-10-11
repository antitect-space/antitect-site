import localFont from "next/font/local";

/**
 * Archivo ExtraBold cut down to the six letters of ANTITECT (about 1KB), for
 * the wordmark in the logo lockup and nothing else. To regenerate it, see
 * assets/README.md.
 */
export const wordmark = localFont({
  src: "../../assets/fonts/archivo-800-wordmark.woff2",
  weight: "800",
  display: "block",
  fallback: ["Arial", "sans-serif"],
});
