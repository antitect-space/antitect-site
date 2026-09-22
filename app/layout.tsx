import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

// One variable file, Latin only, self-hosted and preloaded. Font weight is page weight.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

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
 * The document, and nothing else. The chrome belongs to the two areas of the
 * site, which do not share one: `(site)` is the public company site, header
 * and footer and all; `(learn)` is where a learner works, and carries only
 * what they need. Both render inside this, so there is one `<html>`, one font
 * and one stylesheet.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={archivo.variable}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
