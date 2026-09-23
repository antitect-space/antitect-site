import { ApiError } from "./api";
import { LEARN } from "./area";
import { areaRead } from "./area-api";

/**
 * Everything the learner area reads, and the only place it reads it.
 *
 * The reading itself — no caching, the session forwarded, 401 and 403 told
 * apart — is `area-api`, shared with the tutor area. What is here is the
 * contract: the shapes this half of the API returns.
 */

// ---------------------------------------------------------------------------
// Contract, from docs/cdp-learner-site-plan.md §3. Additive changes are fine;
// a rename is not.
// ---------------------------------------------------------------------------

export interface Learner {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  /** The calendar subscription's secret. Treat the URL built from it as a password. */
  calendarFeedToken?: string;
}

/**
 * Where a run has got to. It chooses the wording — "starts in October" against
 * "enrolment has closed" — and nothing else. Whether there is a form is
 * `enrollmentOpen`'s answer: a run weeks from starting can be full, which
 * reads `enrolling` with no enrolment open.
 */
export type ProgramPhase = "enrolling" | "running" | "finished";

export interface LearnerProgramSummary {
  id: string;
  slug: string;
  title: string;
  /** "Cohort 1". Distinguishes runs of the same programme. */
  runLabel: string | null;
  startsAt: string | null;
  durationWeeks: number | null;
  phase: ProgramPhase;
}

export interface Progress {
  approved: number;
  total: number;
}

/** What the learner API returns. Cancelled and refunded enrolments never appear at all. */
export type EnrollmentStatus = "confirmed" | "completed";

export interface LearnerEnrollment {
  id: string;
  status: EnrollmentStatus;
  program: LearnerProgramSummary;
  progress: Progress;
}

export type SessionStatus = "scheduled" | "cancelled" | "completed";

export interface LearnerSession {
  id: string;
  week: number;
  title: string;
  startsAt: string;
  endsAt: string | null;
  joinUrl: string | null;
  /** An unlisted YouTube link, and only after the session. */
  recordingUrl: string | null;
  status: SessionStatus;
}

/**
 * The one word the UI renders. The API works it out per learner; the site
 * never recomputes progression from submissions of its own.
 */
export type ProjectState =
  | "locked"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "revision_required"
  | "approved";

export interface SubmissionLink {
  label: string;
  url: string;
}

export interface Submission {
  id: string;
  version: number;
  links: SubmissionLink[];
  notes: string | null;
  status: "submitted" | "under_review" | "revision_required" | "approved";
  isLate: boolean;
  submittedAt: string;
  reviewedAt: string | null;
  /** Markdown. */
  feedback: string | null;
}

export interface ProjectSummary {
  id: string;
  order: number;
  week: number;
  title: string;
  whatYoullBuild: string | null;
  deadlineAt: string | null;
  state: ProjectState;
  isLate: boolean;
  latestSubmission: Pick<Submission, "id" | "version" | "status" | "submittedAt"> | null;
}

export interface Resource {
  id: string;
  type: "brief" | "material" | "template" | "guide" | "reference" | "slides";
  title: string;
  /** Null until `available`. Never ask again hoping for a different answer. */
  url: string | null;
  available: boolean;
  releaseAt: string | null;
}

export interface ProjectDetail {
  project: ProjectSummary & {
    whatYoullGain: string | null;
    /** Markdown. */
    brief: string | null;
    requirements: string | null;
    submissionGuidelines: string | null;
  };
  resources: Resource[];
  submissions: Submission[];
}

export interface ProgramOverview {
  program: LearnerProgramSummary & {
    timezone: string;
    meetUrl: string | null;
    bookingUrl: string | null;
    certificateEnabled: boolean;
  };
  enrollment: {
    id: string;
    status: EnrollmentStatus;
    certificateName: string | null;
    completedAt: string | null;
  };
  nextSession: LearnerSession | null;
  currentProject: Pick<ProjectSummary, "id" | "order" | "title" | "deadlineAt" | "state"> | null;
  progress: Progress;
  latestFeedback: {
    projectId: string;
    projectTitle: string;
    version: number;
    status: Submission["status"];
    feedback: string | null;
    reviewedAt: string;
  } | null;
}

export interface Certificate {
  number: string;
  verificationCode: string;
  name: string;
  programTitle: string;
  runLabel: string | null;
  completedOn: string;
  issuedAt: string;
  revokedAt: string | null;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getLearner(): Promise<Learner> {
  const { learner } = await areaRead<{ learner: Learner }>(LEARN, "/me");
  return learner;
}

/**
 * Every programme this learner is on, which is what the switcher lists.
 *
 * Three answers, and they are not the same: 404 is the endpoint not being
 * built yet, an empty list is a learner on nothing, and 401 is no session at
 * all. Only the middle one is a reason to point somebody at the programmes
 * page, so a 404 returns null and the fallback retires itself the day the
 * endpoint lands.
 */
export async function getEnrollments(): Promise<LearnerEnrollment[] | null> {
  try {
    const { items } = await areaRead<{ items: LearnerEnrollment[] }>(LEARN, "/enrollments");
    return items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getProgramOverview(programId: string): Promise<ProgramOverview> {
  return areaRead<ProgramOverview>(LEARN, `/programs/${encodeURIComponent(programId)}`);
}

/** Every session in the run, cancelled ones included: a cancelled session is news, not an absence. */
export async function getSessions(programId: string): Promise<LearnerSession[]> {
  const { items } = await areaRead<{ items: LearnerSession[] }>(
    LEARN,
    `/programs/${encodeURIComponent(programId)}/sessions`,
  );
  return items;
}

/**
 * All six projects, whatever state they are in. Locked ones are listed with
 * everything but the way to submit, because the live sessions run ahead of the
 * work and somebody following along needs to read what is coming.
 */
export async function getProjects(programId: string): Promise<ProjectSummary[]> {
  const { items } = await areaRead<{ items: ProjectSummary[] }>(
    LEARN,
    `/programs/${encodeURIComponent(programId)}/projects`,
  );
  return items;
}

export function getProject(programId: string, projectId: string): Promise<ProjectDetail> {
  return areaRead<ProjectDetail>(
    LEARN,
    `/programs/${encodeURIComponent(programId)}/projects/${encodeURIComponent(projectId)}`,
  );
}

/**
 * Which run a page is about.
 *
 * Three answers, because three things can be true. Somebody who asked for a
 * run they are not on is told so — silently showing them a different
 * programme would be a lie about whose work they are looking at, and it is the
 * one case where a quiet fallback is worse than a refusal. Somebody who asked
 * for nothing gets the run they are actually doing.
 */
export type ChosenRun =
  | { kind: "ok"; enrollment: LearnerEnrollment }
  | { kind: "not-yours" }
  | { kind: "none" };

export function chooseEnrollment(
  enrollments: readonly LearnerEnrollment[],
  wanted?: string,
): ChosenRun {
  if (wanted) {
    const asked = enrollments.find((enrollment) => enrollment.program.id === wanted);
    return asked ? { kind: "ok", enrollment: asked } : { kind: "not-yours" };
  }

  const enrollment =
    enrollments.find((e) => e.program.phase === "running") ??
    enrollments.find((e) => e.status !== "completed") ??
    enrollments[0];

  return enrollment ? { kind: "ok", enrollment } : { kind: "none" };
}

/**
 * The tutor's booking page with the learner's name and email already in it.
 * Cal.com reads both from the query; without them a learner retypes what we
 * already know, on a phone, to book a call we arranged.
 */
export function bookingLink(bookingUrl: string, learner: Learner): string {
  try {
    const url = new URL(bookingUrl);
    const name = [learner.firstName, learner.lastName].filter(Boolean).join(" ");
    if (name) url.searchParams.set("name", name);
    url.searchParams.set("email", learner.email);
    return url.toString();
  } catch {
    // Not a URL we can add to. Better to send them there plain than not at all.
    return bookingUrl;
  }
}
