import type { PublicProgram } from "./api";
import { countWord, formatDay, formatKobo, plural } from "./format";

/**
 * Sentences whose shape is fixed and whose figures come from the programme
 * record. Nothing here may carry a number of its own: a future programme may
 * not be six weeks, or cost the same.
 */

/**
 * "Three live sessions a week, two hours each, plus a thirty-minute one-to-one
 * project review." Null until the record carries both figures, so the copy is
 * never guessed.
 */
export function commitmentSentence(program: PublicProgram): string | null {
  const { sessionsPerWeek: sessions, hoursPerSession: hours } = program;
  if (sessions === null || hours === null) return null;
  return (
    `${capitalise(countWord(sessions))} live ${plural(sessions, "session", "sessions")} a week, ` +
    `${countWord(hours)} ${plural(hours, "hour", "hours")} each, ` +
    "plus a thirty-minute one-to-one project review."
  );
}

/** "6 weeks", or null when the record does not say. */
export function durationLabel(program: PublicProgram): string | null {
  const weeks = program.durationWeeks;
  return weeks === null ? null : `${weeks} ${plural(weeks, "week", "weeks")}`;
}

/** "₦100,000 · Next cohort starts 12 October 2026", or just the price when no date is set. */
export function priceAndCohort(program: PublicProgram): string {
  const price = formatKobo(program.priceKobo);
  return program.startsAt ? `${price} · Next cohort starts ${formatDay(program.startsAt)}` : price;
}

/** "Enrolment closes 5 October 2026", or null. It closes at the start when no date is set. */
export function enrolmentClosesNote(program: PublicProgram): string | null {
  const closes = program.enrollmentClosesAt ?? program.startsAt;
  return closes && program.enrollmentOpen ? `Enrolment closes ${formatDay(closes)}` : null;
}

export type EnrolmentState = "open" | "full" | "closed";

/**
 * Full is checked first: the API reports a full cohort with `enrollmentOpen:
 * false` too, and "this cohort is full" is the truer thing to say.
 */
export function enrolmentState(program: PublicProgram, now: number = Date.now()): EnrolmentState {
  if (program.isFull) return "full";
  const closes = program.enrollmentClosesAt ?? program.startsAt;
  if (!program.enrollmentOpen || (closes && new Date(closes).getTime() <= now)) return "closed";
  return "open";
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
