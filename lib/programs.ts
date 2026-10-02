import type { ProgramProject, PublicProgram } from "./api";
import { countWord, formatDay, formatKobo, plural } from "./format";

/**
 * Sentences whose shape is fixed and whose figures come from the programme
 * record. Nothing here may carry a number of its own: a future programme may
 * not be six weeks, or cost the same.
 */

/**
 * "Three live sessions a week, two hours each, plus a 30-minute Project Review
 * Session each week." Null until the record carries both session figures, so
 * the copy is never guessed.
 */
export function commitmentSentence(program: PublicProgram): string | null {
  const { sessionsPerWeek: sessions, hoursPerSession: hours } = program;
  if (sessions === null || hours === null) return null;

  const live =
    `${capitalise(countWord(sessions))} live ${plural(sessions, "session", "sessions")} a week, ` +
    `${countWord(hours)} ${plural(hours, "hour", "hours")} each`;

  const review = reviewPhrase(program);
  // Absent, not null: the API predates the field, so keep what the page said
  // before it existed. Remove once the CRM has deployed projectReview.
  if (program.projectReview === undefined)
    return `${live}, plus a thirty-minute one-to-one project review.`;
  return review ? `${live}, plus ${review}.` : `${live}.`;
}

/**
 * "a 30-minute Project Review Session each week", from the run's own booking
 * rules, or null for a run without one.
 */
export function reviewPhrase(program: PublicProgram): string | null {
  const review = program.projectReview;
  if (!review) return null;
  return review.perWeek === 1
    ? `a ${review.minutes}-minute Project Review Session each week`
    : `${countWord(review.perWeek)} ${review.minutes}-minute Project Review Sessions a week`;
}

// ---------------------------------------------------------------------------
// The weekly schedule. Times arrive as Lagos wall-clock HH:mm, so they are
// read as they are written: there is no zone to convert, only a clock face.
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "7:00 pm" from "19:00". */
export function wallTime(hhmm: string): string {
  const [hours = 0, minutes = 0] = hhmm.split(":").map(Number);
  const suffix = hours < 12 ? "am" : "pm";
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** "7:00 – 9:00 pm", or "10:00 am – 12:00 pm" when the two halves differ. */
export function wallRange(start: string, end: string): string {
  const from = wallTime(start);
  const to = wallTime(end);
  const [fromClock, fromSuffix] = from.split(" ");
  return fromSuffix === to.split(" ")[1] ? `${fromClock} – ${to}` : `${from} – ${to}`;
}

export interface ScheduleRow {
  key: string;
  day: string;
  time: string;
  title: string | null;
}

/**
 * The weekly pattern as it reads, Monday first: a Sunday session sits at the
 * end of the week, where people expect it, rather than before Tuesday.
 */
export function weeklySchedule(program: PublicProgram): ScheduleRow[] {
  return [...(program.schedule ?? [])]
    .sort((a, b) => (a.day + 6) % 7 - (b.day + 6) % 7 || a.startTime.localeCompare(b.startTime))
    .map((slot) => ({
      key: `${slot.day}-${slot.startTime}`,
      day: DAY_NAMES[slot.day] ?? "",
      time: wallRange(slot.startTime, slot.endTime),
      title: slot.title,
    }));
}

/**
 * "Tuesdays and Thursdays, 7:00 – 9:00 pm, and Saturdays, 10:00 am – 12:00 pm,
 * West Africa Time." Days that share a time are said once. Null with no pattern.
 */
export function scheduleSummary(program: PublicProgram): string | null {
  const rows = weeklySchedule(program);
  if (rows.length === 0) return null;

  const byTime = new Map<string, string[]>();
  for (const row of rows) byTime.set(row.time, [...(byTime.get(row.time) ?? []), `${row.day}s`]);

  const parts = [...byTime.entries()].map(([time, days]) => `${listOf(days)}, ${time}`);
  return `${capitalise(listOf(parts))}, West Africa Time.`;
}

function listOf(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectRow {
  key: string;
  number: number;
  title: string;
  build: string;
  gain: string;
  week: number | null;
}

/**
 * The projects in their own order. `order` wins over the array position when
 * the API sends it; what you build falls back to `description`, which is the
 * same words under their older name.
 */
export function projectRows(program: PublicProgram): ProjectRow[] {
  return program.projects
    .map((project: ProgramProject, index) => ({
      key: `${project.order ?? index}-${project.title}`,
      number: project.order ?? index + 1,
      title: project.title,
      build: project.whatYoullBuild || project.description || "",
      gain: project.whatYoullGain ?? "",
      week: project.week ?? null,
    }))
    .sort((a, b) => a.number - b.number);
}

/** "6 weeks", or null when the record does not say. */
export function durationLabel(program: PublicProgram): string | null {
  const weeks = program.durationWeeks;
  return weeks === null ? null : `${weeks} ${plural(weeks, "week", "weeks")}`;
}

/**
 * Whether the record carries a price. A run taking sign-ups before it is ready
 * to sell has 0 until the team sets one, and 0 is "not settled", never free:
 * a programme is never free.
 */
export function isPriced(program: PublicProgram): boolean {
  return program.priceKobo > 0;
}

/** "₦100,000", or "Price to be confirmed". Never "Free", never "₦0". */
export function priceLabel(program: PublicProgram): string {
  return isPriced(program) ? formatKobo(program.priceKobo) : "Price to be confirmed";
}

/** "12 October 2026", or "Dates to be confirmed". */
export function startLabel(program: PublicProgram): string {
  return program.startsAt ? formatDay(program.startsAt) : "Dates to be confirmed";
}

/** "Cohort 1", or null while the team has not named the run. */
export function runName(program: Pick<PublicProgram, "runLabel">): string | null {
  return program.runLabel?.trim() || null;
}

/**
 * A run under way or finished. Its page stays up, so shared links keep
 * working, and its start date is history rather than something to wait for.
 */
export function isUnderWay(program: PublicProgram): boolean {
  return program.phase === "running" || program.phase === "finished";
}

/** A run up for waitlist sign-ups before it is ready to sell. Never paid for. */
export function isDraft(program: PublicProgram): boolean {
  return program.phase === "draft";
}

/**
 * "₦100,000 · Next cohort starts 12 October 2026", "₦100,000 · Dates to be
 * confirmed", or "Price and dates to be confirmed".
 */
export function priceAndCohort(program: PublicProgram): string {
  if (!isPriced(program) && !program.startsAt) return "Price and dates to be confirmed";
  const price = priceLabel(program);
  return program.startsAt
    ? `${price} · Next cohort starts ${formatDay(program.startsAt)}`
    : `${price} · Dates to be confirmed`;
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

/**
 * How the waitlist is offered: `interest` beside paid enrolment, as the lesser
 * choice; `join` on a draft, as the only thing to do; `next` on a run that is
 * full or closed, where joining means hearing about whichever run comes next.
 */
export type WaitlistWording = "interest" | "join" | "next";

export interface ProgrammeOffer {
  /** Paid enrolment: "Secure your spot". */
  enrol: boolean;
  /** Null while the waitlist is off. */
  waitlist: WaitlistWording | null;
  /** Why enrolment is not on offer. Null while it is, and on a draft, which never enrolled. */
  closed: string | null;
  /** The run to go to instead. */
  nextRun: { href: string; label: string } | null;
  /** Nothing else to offer, so the community is the next step. */
  community: boolean;
}

/**
 * What a run offers, decided from `enrollmentOpen` and `waitlistOpen` together
 * and never from the phase alone. The page, its card and the hero ticket all
 * read this, so they cannot disagree.
 *
 * A draft is never paid for, whatever else the record says. An API that
 * predates the waitlist sends neither field, and reads as it did before: no
 * waitlist, and the community for a closed run.
 */
export function programmeOffer(program: PublicProgram, now: number = Date.now()): ProgrammeOffer {
  const draft = isDraft(program);
  const state = enrolmentState(program, now);
  const enrol = !draft && state === "open";
  const waitlistOpen = program.waitlistOpen === true;

  // A full run's waitlist catches people for the next one, as a closed run's does.
  const waitlist: WaitlistWording | null = !waitlistOpen ? null : enrol ? "interest" : draft ? "join" : "next";

  let closed: string | null = null;
  if (!enrol && !draft) {
    const run = runName(program);
    closed =
      state === "full" ? "This cohort is full." : run ? `Enrolment for ${run} has closed.` : "Enrolment has closed.";
  }

  const nextRun = enrol ? null : nextRunLink(program, { draft, waitlistOpen });

  return { enrol, waitlist, closed, nextRun, community: !enrol && !waitlist && !nextRun };
}

/**
 * The link to the next run. `nextRun` is the run now enrolling or, with none
 * enrolling, one taking sign-ups. A draft links only to one known to be
 * enrolling: pointing one waitlist at another helps nobody. With this run's
 * own waitlist on, the next run's waitlist is the same list, so the link just
 * names the run.
 */
function nextRunLink(
  program: PublicProgram,
  { draft, waitlistOpen }: { draft: boolean; waitlistOpen: boolean },
): ProgrammeOffer["nextRun"] {
  const next = program.nextRun;
  if (!next || next.slug === program.slug) return null;
  if (draft && next.waitlistOpen) return null;

  const run = runName(next);
  const label = !next.waitlistOpen
    ? `${run ?? "The next cohort"} is open for enrolment`
    : waitlistOpen
      ? `See ${run ?? "the next run"}`
      : "Join the waitlist for the next run";

  return { href: `/programmes/${next.slug}${next.waitlistOpen && !waitlistOpen ? "#waitlist" : ""}`, label };
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
