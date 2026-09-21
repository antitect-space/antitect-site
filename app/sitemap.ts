import type { MetadataRoute } from "next";

import { getSitemapSlugs } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";

/** Refreshed hourly. Search engines do not need a new event within the minute. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { events, programs } = await getSitemapSlugs();

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/programmes"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/events"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/community"), changeFrequency: "monthly", priority: 0.6 },
    ...programs.map((slug) => ({
      url: absoluteUrl(`/programmes/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...events.map((slug) => ({
      url: absoluteUrl(`/events/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
