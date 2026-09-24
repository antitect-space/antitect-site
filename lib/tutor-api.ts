import { TEACH } from "./area";
import { areaRead } from "./area-api";

/**
 * What the tutor area reads. The reading itself is `area-api`, shared with the
 * learner side; this is the contract for the tutor half of the API.
 *
 * Fields the API may or may not send are optional here rather than assumed.
 * The screen renders what arrived and leaves out what did not, so a shape that
 * turns out to be slightly different is a missing line rather than a crash.
 */

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  /** The calendar subscription's secret. Treat the URL built from it as a password. */
  calendarFeedToken?: string;
}

export interface TutorProgramSummary {
  id: string;
  title: string;
  runLabel?: string | null;
  slug?: string;
  startsAt?: string | null;
  phase?: "enrolling" | "running" | "finished";
}

export interface QueueLearner {
  id?: string;
  name: string;
  email?: string;
}

export interface QueueProject {
  id: string;
  order: number;
  title: string;
  /** Markdown, both. They come on every item, so the standard needs no second fetch. */
  brief?: string | null;
  requirements?: string | null;
}

export interface SubmissionLink {
  label: string;
  url: string;
}

export type ReviewStatus = "submitted" | "under_review" | "revision_required" | "approved";

/** Still the tutor's to decide. Anything else has been decided already. */
export function isOpen(status: ReviewStatus): boolean {
  return status === "submitted" || status === "under_review";
}

/**
 * One piece of work, as the queue lists it and the review screen reads it.
 * How long it has waited is not a field; it is worked out from `submittedAt`.
 */
export interface QueueItem {
  id: string;
  version: number;
  status: ReviewStatus;
  isLate: boolean;
  submittedAt: string;
  reviewStartedAt?: string | null;
  reviewedAt?: string | null;
  links: SubmissionLink[];
  notes?: string | null;
  /** Markdown. Empty until decided. */
  feedback?: string | null;
  learner: QueueLearner;
  program: TutorProgramSummary;
  project: QueueProject;
}

/** One attempt at the project, and what it was told. */
export interface EarlierVersion {
  id: string;
  version: number;
  status: ReviewStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  /** Markdown. */
  feedback?: string | null;
}

export interface ReviewDetail {
  submission: QueueItem;
  /** Every attempt at this project, oldest first, the current one included. */
  history: EarlierVersion[];
}

/** One page of the queue. The API pages at 25 by default. */
export interface Queue {
  items: QueueItem[];
  total: number;
}

export type Decision = "approve" | "request_revision";

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getTutor(): Promise<Tutor> {
  const { tutor } = await areaRead<{ tutor: Tutor }>(TEACH, "/me");
  return tutor;
}

/** The runs this tutor teaches, and only those. */
export async function getTutorPrograms(): Promise<TutorProgramSummary[]> {
  const { items } = await areaRead<{ items: TutorProgramSummary[] }>(TEACH, "/programs");
  return items;
}

/**
 * The queue, oldest first — the thing a cohort is actually waiting on. The API
 * sorts by `submittedAt` before paging, so page 1 is always the longest wait.
 * A resubmission counts from its own `submittedAt`, so it joins the back.
 *
 * With no status the API sends only what is waiting (submitted or under
 * review). `programId` is checked rather than trusted: asking for a run they
 * do not teach is a refusal, not an empty list.
 */
export async function getQueue(programId?: string): Promise<Queue> {
  const query = programId ? `?programId=${encodeURIComponent(programId)}` : "";
  const { items, total } = await areaRead<{ items: QueueItem[]; total: number }>(
    TEACH,
    `/submissions${query}`,
  );
  return {
    items,
    total: Math.max(total, items.length),
  };
}

/**
 * Every page of one status, oldest first.
 *
 * The API takes one status at a time and pages at up to 100, so a cohort's
 * worth of reviewed work is a few requests at most. The loop is capped so a
 * `totalPages` that never stops growing cannot hold a page open forever.
 */
async function everyPage(status: ReviewStatus, programId?: string): Promise<QueueItem[]> {
  const items: QueueItem[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const query = new URLSearchParams({ status, limit: "100", page: String(page) });
    if (programId) query.set("programId", programId);
    const result = await areaRead<{ items: QueueItem[]; totalPages?: number }>(
      TEACH,
      `/submissions?${query}`,
    );
    items.push(...result.items);
    if (!result.totalPages || page >= result.totalPages) break;
  }
  return items;
}

/**
 * Work that has been decided — approved, or sent back for changes. The queue
 * is what is waiting; this is what is done, kept so a tutor can go back to
 * what somebody sent and what they were told about it.
 */
export async function getReviewed(programId?: string): Promise<QueueItem[]> {
  const [approved, revising] = await Promise.all([
    everyPage("approved", programId),
    everyPage("revision_required", programId),
  ]);
  return [...approved, ...revising];
}

export function getReview(submissionId: string): Promise<ReviewDetail> {
  return areaRead<ReviewDetail>(TEACH, `/submissions/${encodeURIComponent(submissionId)}`);
}

/** The attempts before this one, oldest first. The API's history includes the current one. */
export function earlierVersions(detail: ReviewDetail): EarlierVersion[] {
  return (detail.history ?? [])
    .filter((version) => version.id !== detail.submission.id)
    .sort((a, b) => a.version - b.version);
}

// ---------------------------------------------------------------------------
// Project Review Sessions, from the tutor's side (tutor plan §3). The tutor
// opens windows of time; the API cuts them into slots and learners book them.
// ---------------------------------------------------------------------------

export interface WindowSlot {
  startsAt: string;
  endsAt: string;
  week: number;
  booking: { id: string; learnerName: string; learnerEmail?: string } | null;
}

export interface ReviewWindow {
  id: string;
  startsAt: string;
  endsAt: string;
  joinUrl: string | null;
  slots: WindowSlot[];
}

export interface TutorReviews {
  minutes: number;
  perWeek: number;
  cancelCutoffHours: number;
  minNoticeHours: number;
  windows: ReviewWindow[];
}

export function getTutorReviews(programId: string): Promise<TutorReviews> {
  return areaRead<TutorReviews>(TEACH, `/programs/${encodeURIComponent(programId)}/reviews`);
}

/**
 * Windows still to come, soonest first, and those already over, most recent
 * first. Worked out per request: /teach is never cached, so the server's clock
 * is the right one.
 */
export function splitWindows(
  windows: readonly ReviewWindow[],
  now: number = Date.now(),
): { upcoming: ReviewWindow[]; earlier: ReviewWindow[] } {
  const sorted = [...windows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return {
    upcoming: sorted.filter((w) => new Date(w.endsAt).getTime() > now),
    earlier: sorted.filter((w) => new Date(w.endsAt).getTime() <= now).reverse(),
  };
}
