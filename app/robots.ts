import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Nothing behind a sign-in, and nothing about one payment, belongs in an index.
    rules: { userAgent: "*", allow: "/", disallow: ["/payment/", "/learn/", "/teach/", "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
