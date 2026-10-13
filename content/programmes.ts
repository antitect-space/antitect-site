import type { FaqItem } from "@/content/faq";

/**
 * The programmes page and each programme's page: the fixed copy from the
 * design. Nothing here carries a price, a date, a length or a count; those
 * come from each programme's record and are put into sentences where they are
 * read.
 */

export const programmesPage = {
  title: "Capability development programmes",
  description:
    "Antitect’s capability development programmes: several weeks, live online, building real projects on your own work, with a one-to-one review every week.",
  lead: "Several weeks, live online, building real projects on your own work, with a one-to-one review every week.",
  facts: "Several weeks · Live online · Priced per programme",
  nothing: {
    title: "No programme is open right now.",
    line: "Join the community and you’ll hear first when the next cohort opens.",
  },
  howItWorks: "How every programme works",
  teach: "See how we teach",
  startSooner: {
    label: "Start sooner",
    text: "Not ready for several weeks? Start with a free webinar or a one-day workshop.",
    links: [
      { label: "See webinars", href: "/webinars" },
      { label: "See workshops", href: "/workshops" },
    ],
  },
  faqTitle: "Questions about programmes",
} as const;

export const programmesFaq: readonly FaqItem[] = [
  {
    question: "Do I need to be technical?",
    answer: "No. Each programme introduces the concepts and tools as its projects need them.",
  },
  {
    question: "How much time does it take?",
    answer: "Each programme lists its weekly commitment: the live sessions, the work between them, and your review.",
  },
  { question: "Is it online?", answer: "Yes. Programmes are live online." },
  { question: "How do I pay?", answer: "Securely through Paystack. Your place is confirmed when payment clears." },
  { question: "Can I use a discount code?", answer: "Yes. You can add one before you pay." },
];

export const programmePage = {
  back: { label: "All programmes", href: "/programmes" },
  kind: "Capability development programme",
  asks: "What it asks of you",
  build: "What you’ll build",
  leaveWith: "What you leave with",
  certificate: "A digital certificate when you complete the programme",
  teach: "See how we teach",
  notAvailable: {
    title: "This programme isn’t available.",
    primary: { label: "See our programmes", href: "/programmes" },
    secondary: { label: "Join the community", href: "/community" },
  },
} as const;
