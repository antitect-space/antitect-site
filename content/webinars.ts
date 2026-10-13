import type { FaqItem } from "@/content/faq";
import { filled } from "@/lib/content";

/**
 * The webinars page and each webinar's page: the fixed copy from the design.
 * Nothing here carries a date, a time, a price or a count; those come from
 * the CRM and are put into sentences where they are read.
 */

export const webinarsPage = {
  title: "Free webinars",
  description:
    "Free live online sessions from Antitect on one practical AI topic at a time. Watch it done, ask questions, and leave with an idea for your own work.",
  lead: "Live online sessions on one practical AI topic at a time. Watch it done, ask questions, and leave with an idea for your own work.",
  facts: "Free · Live online",
  nextUp: "Next up",
  also: "Also coming up",
  nothing: {
    title: "No webinar scheduled yet.",
    line: "Join the community and you’ll hear about the next one first.",
  },
  past: {
    title: "Watch a past webinar",
    line: "See what a session is like before you register.",
    more: "Show more",
  },
  goFurther: "Go further than a webinar.",
  faqTitle: "Questions about webinars",
} as const;

export const webinarPage = {
  back: { label: "All webinars", href: "/webinars" },
  cover: "What we’ll cover",
  covered: "What we covered",
  sessionLike: "See what a session is like",
  moreUpcoming: "More upcoming webinars",
  moreRecordings: "More recordings",
  nextStep: {
    text: "Want to build something, not just watch it? Try a one-day workshop, or go deeper with a capability development programme.",
    links: [
      { label: "See workshops", href: "/workshops" },
      { label: "See programmes", href: "/programmes" },
    ],
  },
  notAvailable: {
    title: "This webinar isn’t available.",
    primary: { label: "See upcoming webinars", href: "/webinars" },
    secondary: { label: "Join the community", href: "/community" },
  },
} as const;

/**
 * "Questions about webinars". Answers the team has not confirmed stay out
 * (`null`), and the question about past sessions is asked only where there is
 * one to watch.
 */
export const webinarFaq = {
  free: { question: "Is it really free?", answer: "Yes. Webinars are free, and there’s nothing to pay when you register." },
  technical: { question: "Do I need to be technical?", answer: "No. Sessions show AI used on everyday work, with no coding." },
  joining: {
    question: "How do I join on the day?",
    answer: "Your joining link comes with your reminders, a day before and an hour before the session.",
  },
  past: {
    question: "Can I watch a past session first?",
    answer: "Yes. Recorded sessions are under “Watch a past webinar” on the webinars page.",
  },
  questions: { question: "Can I ask questions?", answer: "Yes, during the live session." },
  needs: {
    question: "What do I need?",
    // TODO(content): the device, platform and connection needed to join.
    answer: null as string | null,
  },
} as const;

/** The questions, in the design's order, leaving out what cannot be answered truthfully here. */
export function webinarFaqItems({ recordings }: { recordings: boolean }): FaqItem[] {
  const { free, technical, joining, past, questions, needs } = webinarFaq;
  const candidates: Array<{ question: string; answer: string | null } | null> = [
    free,
    technical,
    joining,
    recordings ? past : null,
    questions,
    needs,
  ];
  return candidates.flatMap((item) => (item && filled(item.answer) ? [{ question: item.question, answer: item.answer }] : []));
}
