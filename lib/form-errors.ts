import { ApiError } from "./api";
import { PERSON_FIELDS, type PersonField } from "./schemas";
import { CONTACT } from "./site";

/**
 * What a failed submit means for the form, decided in one place so every form
 * behaves the same. Errors say what happened and what to do; they do not
 * apologise and are never vague. The form's input is never cleared.
 */
export type Failure =
  /** The thing is full. Replace the form. */
  | { kind: "full" }
  /** Registration or enrolment has closed. Replace the form. */
  | { kind: "closed" }
  /** Field messages to put back on their inputs. */
  | { kind: "fields"; fields: Array<{ field: FormField; message: string }> }
  /** A message above the submit button. */
  | { kind: "message"; message: string };

export type FormField = PersonField | "discountCode";

const GENERIC = "Something went wrong on our side. Your details are still here, so try again in a moment.";

function isFormField(name: string): name is FormField {
  return name === "discountCode" || (PERSON_FIELDS as ReadonlyArray<string>).includes(name);
}

export function describeFailure(error: unknown): Failure {
  if (!(error instanceof ApiError)) return { kind: "message", message: GENERIC };

  switch (error.code) {
    case "EVENT_FULL":
    case "PROGRAM_FULL":
      return { kind: "full" };
    case "EVENT_NOT_FOUND":
    case "PROGRAM_NOT_FOUND":
      return { kind: "closed" };
    case "RATE_LIMITED":
      return { kind: "message", message: "Too many attempts from this connection. Wait a minute, then try again." };
    case "NETWORK":
      return { kind: "message", message: "We could not reach our server. Check your connection and try again." };
    case "PAYMENT_UNAVAILABLE":
      return {
        kind: "message",
        message: "Paystack could not start the payment, and nothing was charged. Try again in a moment.",
      };
    case "PAYMENT_REQUIRED":
    case "PAYMENT_NOT_REQUIRED":
      // The cached page is older than a price change on the event.
      return { kind: "message", message: "The price of this event has changed. Reload the page to continue." };
    case "CONTACT_CONFLICT":
      return {
        kind: "message",
        message: `That email address and WhatsApp number are on record for two different people. Use the pair you used before, or write to ${CONTACT.email}.`,
      };
    case "VALIDATION_ERROR": {
      const details = error.details ?? {};
      // Not something the visitor can fix: the event started, or enrolment closed.
      if (details.event || details.program) return { kind: "closed" };

      const fields = Object.entries(details).flatMap(([field, messages]) => {
        const name = field === "code" ? "discountCode" : field;
        return isFormField(name) && messages[0] ? [{ field: name, message: messages[0] }] : [];
      });
      if (fields.length > 0) return { kind: "fields", fields };
      return { kind: "message", message: error.message || "Some of those details need fixing." };
    }
    default:
      return { kind: "message", message: GENERIC };
  }
}
