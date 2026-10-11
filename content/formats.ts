/**
 * "Three ways to learn" (Home B, section 3): the fixed part of each format
 * card. What each format is never changes with the schedule; what is next
 * comes from the CRM, and is built where it is read.
 */

export const formatsSection = {
  id: "three-ways",
  title: "Start free. Go as deep as you need.",
  intro: "Every format teaches practical AI on real work. They differ in how deep they go.",
} as const;

export interface Format {
  depth: 1 | 2 | 3;
  /** Beside the depth indicator: how long the format asks of you. */
  time: string;
  title: string;
  promise: string;
  facts: string;
  description: string;
  link: { label: string; href: string };
}

// TODO(redesign): the webinars and workshops links go to /webinars and /workshops once those pages exist.
export const formats = {
  webinars: {
    depth: 1,
    time: "About 2 hours",
    title: "Webinars",
    promise: "See what’s possible.",
    facts: "Free · Live online · About 2 hours",
    description:
      "One practical topic per session. Watch it done live, ask questions, and leave with a first idea for your own work.",
    link: { label: "All webinars", href: "/events" },
  },
  workshops: {
    depth: 2,
    time: "One day",
    title: "Workshops",
    promise: "Build your first one.",
    facts: "One day · In person · Priced per workshop",
    description: "A full day building with instructors in the room. You leave with something that works.",
    link: { label: "See how Workshop 001 went", href: "#workshop-001" },
  },
  programmes: {
    depth: 3,
    time: "Several weeks",
    title: "Capability development programmes",
    promise: "Become able to do it on your own.",
    facts: "Several weeks · Live online · Priced per programme",
    description: "Build a series of real projects, with a one-to-one review of your work every week.",
    link: { label: "All programmes", href: "/programmes" },
  },
} as const satisfies Record<string, Format>;

/** When the CRM has nothing to show: the community is how people hear about the next one. */
export const nothingNext = {
  events: "No date set yet.",
  programmes: "No cohort open right now.",
  action: { label: "Join the community", href: "/community" },
} as const;
