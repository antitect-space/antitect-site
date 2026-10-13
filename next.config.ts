import type { NextConfig } from "next";

type RemotePattern = Exclude<
  NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number],
  URL
>;

/**
 * Event images come from one of two hosts, depending on the CRM's
 * STORAGE_PROVIDER: Cloudinary, or the API's own `/uploads`. Both are allowed,
 * or an image that renders today stops rendering the day storage is switched.
 */
function apiUploadsPattern(): RemotePattern | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  const url = new URL(apiUrl);
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/uploads/**",
  };
}

const isDev = process.env.NODE_ENV === "development";
const uploads = apiUploadsPattern();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * The site spells it "programmes"; the API and some CRM email links say
   * "programs". Both reach the same page, so no link in a sent email breaks.
   */
  redirects() {
    return [
      { source: "/programs", destination: "/programmes", permanent: true },
      { source: "/programs/:slug", destination: "/programmes/:slug", permanent: true },
      // Events split into webinars and workshops. A single old event link is
      // sent on by type in app/(site)/events/[slug]/route.ts, which has to
      // read the event to know which.
      { source: "/events", destination: "/webinars", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Recording thumbnails. The videos themselves load only on a tap, from youtube-nocookie.com.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      ...(uploads ? [uploads] : []),
    ],
    // Only so local development can show images from an API on localhost.
    // Never in production: it would let the optimiser fetch internal addresses.
    dangerouslyAllowLocalIP: isDev,
  },
};

export default nextConfig;
