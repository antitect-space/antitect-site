import type { ProjectState } from "./learner-api";

/**
 * What each project state means to the person looking at it.
 *
 * The API works the state out per learner and this site never recomputes it —
 * progression is the API's business, and two answers to "can I submit yet"
 * would eventually disagree. All this does is put the state into words.
 */
export const PROJECT_STATE: Record<ProjectState, { label: string; meaning: string; tone: "waiting" | "open" | "done" }> = {
  locked: {
    label: "Not open yet",
    meaning: "Opens when the project before it is approved.",
    tone: "waiting",
  },
  in_progress: {
    label: "In progress",
    meaning: "Yours to build and submit.",
    tone: "open",
  },
  submitted: {
    label: "Submitted",
    meaning: "With your tutor. Nothing to do until they come back to you.",
    tone: "waiting",
  },
  under_review: {
    label: "Being reviewed",
    meaning: "Your tutor is looking at it now.",
    tone: "waiting",
  },
  revision_required: {
    label: "Changes asked for",
    meaning: "Read the feedback, then submit a new version.",
    tone: "open",
  },
  approved: {
    label: "Approved",
    meaning: "Done. The next project is open.",
    tone: "done",
  },
};

/** Which project somebody is actually on, for a list that leads with it. */
export function isCurrent(state: ProjectState): boolean {
  return state === "in_progress" || state === "revision_required";
}
