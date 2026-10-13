import type { Metadata, Viewport } from "next";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Practical AI Training in Nigeria — ${SITE_NAME}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  themeColor: "#FEFEFE",
};

/**
 * The document, and nothing else. The chrome belongs to the areas of the
 * site, which do not share one: `(site)` is the public company site, header
 * and footer and all; `/learn` and `/teach` are where learners and tutors
 * work, and carry only what they need. Each area loads its own fonts, so this
 * loads none: there is one `<html>` and one stylesheet.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG">
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
