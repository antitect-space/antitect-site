import { ApiError } from "./api";
import { CONTACT } from "./site";

/**
 * What a failed learner request means for the form it came from. Same job as
 * `describeFailure` does for the public forms, and kept apart from it because
 * none of the answers are the same: a learner is never told a cohort is full,
 * and a visitor is never told their link has expired.
 */

export type LearnerField = "email" | "password";

export type LearnerFailure =
  /** The invitation or reset link is spent. The page offers a fresh one. */
  | { kind: "expired" }
  /** Field messages to put back on their inputs. */
  | { kind: "fields"; fields: Array<{ field: LearnerField; message: string }> }
  /** A message above the submit button. */
  | { kind: "message"; message: string };

const GENERIC = "Something went wrong on our side. Try again in a moment.";

function isLearnerField(name: string): name is LearnerField {
  return name === "email" || name === "password";
}

export function describeLearnerFailure(error: unknown): LearnerFailure {
  if (!(error instanceof ApiError)) return { kind: "message", message: GENERIC };

  if (error.status === 410 || error.code === "TOKEN_EXPIRED" || error.code === "TOKEN_USED") {
    return { kind: "expired" };
  }

  switch (error.code) {
    case "INVALID_CREDENTIALS":
      // Never "no such account": that would say who has one.
      return { kind: "message", message: "That email address and password do not match." };
    case "ACCOUNT_DISABLED":
      return {
        kind: "message",
        message: `This account is closed. Write to ${CONTACT.email} if that is not right.`,
      };
    case "RATE_LIMITED":
      // The API counts the attempts, so its wording is the accurate one.
      return { kind: "message", message: error.message || "Too many attempts. Wait a minute, then try again." };
    case "NETWORK":
      return {
        kind: "message",
        message: "We could not reach our server. Check your connection and try again.",
      };
    case "VALIDATION_ERROR": {
      const fields = Object.entries(error.details ?? {}).flatMap(([field, messages]) =>
        isLearnerField(field) && messages[0] ? [{ field, message: messages[0] }] : [],
      );
      if (fields.length > 0) return { kind: "fields", fields };
      return { kind: "message", message: error.message || "Check those details and try again." };
    }
    default:
      return { kind: "message", message: error.status === 401 ? "Sign in again to continue." : GENERIC };
  }
}
