/**
 * The home page's fixed copy, from the design file (Home B). Nothing here may
 * carry a date, a price or a count: those come from the CRM, and a sentence
 * that needs one is built where the figure is read.
 */

export const hero = {
  title: "Put AI to work in your job and your business.",
  lead: "Antitect teaches people to use AI on their real work through different programmes. No coding needed.",
  primary: { label: "See what’s on", href: "#three-ways" },
  secondary: { label: "Join the free community", href: "/community" },
} as const;

/** The live line under the header when no webinar is scheduled. */
export const liveLineFallback = {
  label: "Join the free community to hear about the next session",
  href: "/community",
} as const;
