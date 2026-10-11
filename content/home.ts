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

export const contact = {
  title: "Talk to us.",
  line: "Questions about a webinar, a workshop or a programme? Message us.",
  // TODO(content): how soon the team replies, once it is confirmed: "We reply within …".
  replyTime: null as string | null,
  whatsapp: { label: "Message us on WhatsApp", prefill: "Hi Antitect, I have a question about…" },
} as const;

export const close = {
  title: "Hear about every new session.",
  body: "Join the free Antitect community on WhatsApp. You’ll get new webinar dates, workshop openings and programme announcements as soon as they’re set.",
  // TODO(content): how often the community hears from Antitect, once it is confirmed.
  cadence: null as string | null,
  action: { label: "Join free", href: "/community" },
  note: "Free · Leave any time",
} as const;

/** The live line under the header when no webinar is scheduled. */
export const liveLineFallback = {
  label: "Join the free community to hear about the next session",
  href: "/community",
} as const;
