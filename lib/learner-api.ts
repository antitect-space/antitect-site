import { ApiError, readApiError, serverApiUrl } from "./api";
import { clientHeaders, learnerCookieHeader, learnerToken, visitorIp } from "./learner-session";

/**
 * Everything the learner area reads, and the only place it reads it.
 *
 * Nothing here is ever cached. A learner's schedule, feedback and progress are
 * theirs and change without warning, so every page fetches per request with
 * `no-store` — never the sixty-second cache the public pages run on.
 *
 * Reads happen on the server, with the token forwarded from the cookie. The
 * browser never calls the API directly; writes go through `/api/learn/*` on
 * this origin.
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

/** Long enough for an API waking from sleep, short enough that a page is not held open forever. */
const TIMEOUT_MS = 20_000;

/** Thrown when there is no usable session. Pages turn this into a redirect to the login page. */
export class NoSession extends Error {
  constructor() {
    super("No learner session");
    this.name = "NoSession";
  }
}

/**
 * A learner read. Throws `NoSession` when there is no token or the API rejects
 * the one we have — being logged out is not an error worth a stack trace.
 */
export async function learnerRead<T>(path: string): Promise<T> {
  const token = await learnerToken();
  if (!token) throw new NoSession();

  let response: Response;
  try {
    response = await fetch(`${serverApiUrl()}/api/learner${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: learnerCookieHeader(token),
        ...clientHeaders(await visitorIp()),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new ApiError(0, "NETWORK", `Could not reach the API for ${path}: ${reason}`);
  }

  if (response.status === 401) throw new NoSession();
  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}

export async function getLearner(): Promise<Learner> {
  const { learner } = await learnerRead<{ learner: Learner }>("/me");
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
    const { items } = await learnerRead<{ items: LearnerEnrollment[] }>("/enrollments");
    return items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getProgramOverview(programId: string): Promise<ProgramOverview> {
  return learnerRead<ProgramOverview>(`/programs/${encodeURIComponent(programId)}`);
}
