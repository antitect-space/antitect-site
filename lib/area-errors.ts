import { ApiError } from "./api";
import { CONTACT } from "./site";

/**
 * What a failed sign-in means for the form it came from, in either area. Same
 * job as `describeFailure` does for the public forms, and kept apart from it
 * because none of the answers are the same: somebody signing in is never told
 * a cohort is full, and a visitor is never told their link has expired.
 */

export type AreaField = "email" | "password";

export type AreaFailure =
  /** The invitation or reset link is spent. The page offers a fresh one. */
  | { kind: "expired" }
  /** Field messages to put back on their inputs. */
  | { kind: "fields"; fields: Array<{ field: AreaField; message: string }> }
  /** A message above the submit button. */
  | { kind: "message"; message: string };

const GENERIC = "Something went wrong on our side. Try again in a moment.";

function isAreaField(name: string): name is AreaField {
  return name === "email" || name === "password";
}

export function describeAreaFailure(error: unknown): AreaFailure {
  if (!(error instanceof ApiError)) return { kind: "message", message: GENERIC };

  if (error.status === 410 || error.code === "TOKEN_EXPIRED" || error.code === "TOKEN_USED") {
    return { kind: "expired" };
  }

  switch (error.code) {
    case "INVALID_CREDENTIALS":
    case "UNAUTHORIZED":
      // The API's own words, which are written for a person and say the right
      // thing whether this was a wrong password or a session that ran out. It
      // never says whether the address has an account: that would tell a
      // stranger who is enrolled.
      return {
        kind: "message",
        message: error.message || "That email address and password do not match.",
      };
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
      // One entry per message, so a field that failed three ways says all
      // three. Callers wanting only the first can still take it.
      const fields = Object.entries(error.details ?? {}).flatMap(([field, messages]) =>
        isAreaField(field) ? messages.map((message) => ({ field, message })) : [],
      );
      if (fields.length > 0) return { kind: "fields", fields };
      return { kind: "message", message: error.message || "Check those details and try again." };
    }
    default:
      return { kind: "message", message: error.status === 401 ? "Sign in again to continue." : GENERIC };
  }
}
