import { Newsreader, Public_Sans } from "next/font/google";

/**
 * The public site's type: Public Sans for text, Newsreader for headings. Each
 * is one variable file per subset, self-hosted and preloaded only on the
 * routes that import this module, so the learner and tutor areas never pay
 * for them.
 *
 * Public Sans carries the naira sign (₦), which Google files under latin-ext:
 * that face downloads only on a page that shows a price.
 *
 * Newsreader leaves out its optical-size axis. With it, the Latin file grows
 * from about 57KB to about 129KB, too much for a phone on mobile data, and at
 * heading sizes the difference is hard to see.
 */
export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
});
