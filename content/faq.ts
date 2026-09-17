import type { PublicProgram } from "@/lib/api";
import { countWord, formatKobo, plural } from "@/lib/format";
import { capitalise as cap, durationLabel } from "@/lib/programs";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * The eleven questions from the Antitect DLI document, edited for length, with
 * "DLI" replaced by "Antitect", plus the two the copy doc adds. Cost stays near
 * the end, after the value has been made.
 *
 * Answers that carry a price, a duration or a session count are built from the
 * programme record and left out entirely when there is none. A figure written
 * here would outlive the cohort it was true for.
 */
export function buildFaq(program: PublicProgram | null): FaqItem[] {
  const items: Array<FaqItem | null | false> = [
    {
      question: "What is Antitect?",
      answer:
        "Antitect develops practical, economically relevant capability through guided, project-based learning. Learning should lead to the ability to do.",
    },
    {
      question: "How is Antitect different from a regular online course?",
      answer:
        "It is project-first. You start with a defined project and learn the concepts, tools and processes needed to build it. Your instructor reviews your work and helps you improve it until the project is complete.",
    },
    {
      question: "How does the learning work?",
      answer:
        "You learn, build and receive feedback throughout the programme. Each project comes with the resources, live instruction and support you need to complete it.",
    },
    {
      question: "What will I actually build?",
      answer: "Real, practical projects based on the capability you are developing.",
    },
    program && program.durationWeeks !== null && {
      question: "How long is the programme?",
      answer: `${program.title} runs for ${durationLabel(program)}.`,
    },
    program && program.sessionsPerWeek !== null && program.hoursPerSession !== null && {
      question: "How much time will I need?",
      answer:
        `${cap(countWord(program.sessionsPerWeek))} live ${plural(program.sessionsPerWeek, "session", "sessions")} each week, ` +
        `${countWord(program.hoursPerSession)} ${plural(program.hoursPerSession, "hour", "hours")} per session, ` +
        "plus time to work on your projects on your own.",
    },
    {
      question: "When are the classes?",
      answer:
        "Live sessions are scheduled around working professionals, with weekday evening sessions and a weekend session. Exact times are given for each cohort.",
    },
    {
      question: "What if I miss a live session?",
      answer:
        "Sessions are recorded. The one-to-one project review is rescheduled, not skipped — it is the part that matters most.",
    },
    {
      question: "Will I get personal support?",
      answer:
        "Yes. You get a thirty-minute one-to-one project review every week, as well as the live sessions and support from the community.",
    },
    {
      question: "Do I need to be technical?",
      answer:
        "No. You do not need advanced technical or coding experience. The programme is built around practical application and guided building.",
    },
    {
      question: "What will I gain from the programme?",
      answer:
        "A practical capability and a portfolio of completed projects you can use in your business, your work or your career.",
    },
    program && {
      question: "How much does it cost?",
      answer: `${formatKobo(program.priceKobo)} for ${program.title}. That covers the live sessions, the projects, a weekly one-to-one review, learning resources and community support.`,
    },
    program && {
      question: "Do I need to pay before the cohort starts?",
      answer: "Yes. Your place is confirmed when payment clears.",
    },
  ];

  return items.filter((item): item is FaqItem => Boolean(item));
}

