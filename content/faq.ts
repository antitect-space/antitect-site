import type { PublicProgram } from "@/lib/api";
import { formatDay, formatKobo, countWord, plural } from "@/lib/format";
import { durationLabel, scheduleSummary } from "@/lib/programs";

export interface FaqItem {
  question: string;
  answer: string;
  /** The team's own answers are Markdown; the site's are plain sentences. */
  markdown?: boolean;
}

/**
 * The home page answers for Antitect, never for one programme. It lists
 * several, so a price or a length here would be wrong for most of them — and
 * wrong the moment a cohort changes. Anything cohort-specific lives on the
 * programme's own page, built from its record.
 *
 * Two sentences each, hard limit.
 */
export const generalFaq: ReadonlyArray<FaqItem> = [
  {
    question: "What is Antitect?",
    answer:
      "Antitect develops practical AI capability through guided, project-based learning. You build real things, and an instructor reviews what you build.",
  },
  {
    question: "How is this different from an online course?",
    answer:
      "You start with a project rather than a syllabus, and learn what that project needs. You finish when the thing works.",
  },
  {
    question: "Do I need to be technical?",
    answer: "No. The work is applying tools to real problems, not writing code.",
  },
  {
    question: "What will I actually build?",
    answer:
      "Projects you can use in your own work. Each programme page lists what that cohort builds.",
  },
  {
    question: "When are sessions held?",
    answer:
      "Live sessions are scheduled around working people: weekday evenings and a weekend session. Exact times come with each cohort.",
  },
  {
    question: "What if I miss a live session?",
    answer: "Sessions are recorded. Nothing in your progress depends on attendance.",
  },
];

/**
 * The questions a cohort can answer for itself: what it costs, how long it
 * runs, what it asks of your week, and when payment is due. Every figure is
 * read from the record, and a question whose figure is missing is left out
 * rather than guessed.
 */
export function programmeFaq(program: PublicProgram): FaqItem[] {
  // The team's questions, when they have written some, in their order. They
  // replace these rather than join them: two answers to one question is how
  // a page ends up contradicting itself.
  if (program.faq && program.faq.length > 0) {
    return program.faq.map((item) => ({ ...item, markdown: true }));
  }

  const schedule = scheduleSummary(program);
  const items: Array<FaqItem | false> = [
    program.durationWeeks !== null && {
      question: "How long does it run?",
      answer: `${program.title} runs for ${durationLabel(program)}.`,
    },
    program.sessionsPerWeek !== null &&
      program.hoursPerSession !== null && {
        question: "How much time will I need each week?",
        answer: `${cap(countWord(program.sessionsPerWeek))} live ${plural(program.sessionsPerWeek, "session", "sessions")} a week, ${countWord(program.hoursPerSession)} ${plural(program.hoursPerSession, "hour", "hours")} each, plus your own project time.`,
      },
    {
      question: "How much does it cost?",
      answer: `${formatKobo(program.priceKobo)}. That covers the live sessions, the projects, the weekly review, resources and community support.`,
    },
    {
      question: "Do I need to pay before it starts?",
      answer: program.startsAt
        ? `Yes. Your place is confirmed when payment clears, and the cohort starts on ${formatDay(program.startsAt)}.`
        : "Yes. Your place is confirmed when payment clears.",
    },
    {
      question: "When are sessions held?",
      // The real times once the team has set the weekly pattern; until then,
      // the shape of it, and never a guess at the hours.
      answer:
        schedule ??
        "Weekday evenings and a weekend session, so you can keep working. Exact times are sent to everybody enrolled.",
    },
  ];

  return items.filter((item): item is FaqItem => Boolean(item));
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
