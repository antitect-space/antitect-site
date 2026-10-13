import type { FaqItem } from "@/content/faq";
import { formats, type Format } from "@/content/formats";
import { filled } from "@/lib/content";

/**
 * The workshops page and each workshop's page: the fixed copy from the
 * design. Nothing here carries a date, a time, a price, a venue or a count;
 * those come from the CRM and are put into sentences where they are read.
 */

export const workshopsPage = {
  title: "Workshops",
  description:
    "One-day, in-person workshops from Antitect: build something that works with AI, with instructors in the room. No coding needed.",
  lead: "One day in a room with instructors, building something that works.",
  facts: "One day · In person · Priced per workshop",
  nextUp: "Next workshop",
  also: "Also coming up",
  nothing: {
    title: "No workshop scheduled yet.",
    line: "Join the community and you’ll hear first when the next one opens.",
  },
  past: "Past workshops",
  goFurther: "Go further than a workshop.",
  faqTitle: "Questions about workshops",
} as const;

/** "Go further than a workshop.": the webinars card says only what is true of every webinar. */
export const workshopsGoFurther: ReadonlyArray<{ format: Format; link: { label: string; href: string } }> = [
  { format: { ...formats.webinars, facts: "Free · Live online" }, link: { label: "See webinars", href: "/webinars" } },
  { format: formats.programmes, link: { label: "See programmes", href: "/programmes" } },
];

export const workshopPage = {
  back: { label: "All workshops", href: "/workshops" },
  build: "What we’ll build",
  pastWorkshop: "See a past workshop",
  moreUpcoming: "More upcoming workshops",
  notAvailable: {
    title: "This workshop isn’t available.",
    primary: { label: "See upcoming workshops", href: "/workshops" },
    secondary: { label: "Join the community", href: "/community" },
  },
} as const;

/** "Questions about workshops". Answers the team has not confirmed stay out until they are set. */
export const workshopFaq = {
  bring: {
    question: "What should I bring?",
    // TODO(content): what to bring to a workshop.
    answer: null as string | null,
  },
  food: {
    question: "Is food included?",
    // TODO(content): whether food is included.
    answer: null as string | null,
  },
  missed: {
    question: "What if I can’t make it?",
    // TODO(content): the refund or transfer policy, with a link to the Refunds page once it exists.
    answer: null as string | null,
  },
  discount: { question: "Can I use a discount code?", answer: "Yes. You can add one before you pay." },
  technical: {
    question: "Do I need to be technical?",
    answer: "No. You build with instructors in the room, and no coding is needed.",
  },
};

export function workshopFaqItems(): FaqItem[] {
  return Object.values(workshopFaq).flatMap((item) =>
    filled(item.answer) ? [{ question: item.question, answer: item.answer }] : [],
  );
}
