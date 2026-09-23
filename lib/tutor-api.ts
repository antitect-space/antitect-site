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

export function getReview(submissionId: string): Promise<ReviewDetail> {
  return areaRead<ReviewDetail>(TEACH, `/submissions/${encodeURIComponent(submissionId)}`);
}

/** The attempts before this one, oldest first. The API's history includes the current one. */
export function earlierVersions(detail: ReviewDetail): EarlierVersion[] {
  return (detail.history ?? [])
    .filter((version) => version.id !== detail.submission.id)
    .sort((a, b) => a.version - b.version);
}
