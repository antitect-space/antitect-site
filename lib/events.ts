import type { PublicEvent, PublicProgram } from "./api";
import { formatKobo, hasStarted } from "./format";

export type RegistrationState = "open" | "full" | "closed";

/**
 * Whether the form should be offered. The API is the final word: a cached
 * page can be up to a minute old, so the form checks again and the POST
 * answers with EVENT_FULL or "already started" if this was stale.
 */
export function registrationState(event: PublicEvent, now: number = Date.now()): RegistrationState {
  if (hasStarted(event.startsAt, now)) return "closed";
  if (event.isFull) return "full";
  return "open";
}

export function isPaid(event: PublicEvent): boolean {
  return event.priceKobo > 0;
}

/** "Free webinar", "Workshop · In person · ₦25,000". */
export function eventLabel(event: PublicEvent): string {
  const kind = event.type === "workshop" ? "Workshop" : "Webinar";
  const parts: string[] = [];

  if (isPaid(event)) {
    parts.push(kind);
  } else {
    parts.push(`Free ${kind.toLowerCase()}`);
  }
  parts.push(event.format === "in_person" ? "In person" : "Online");
  if (isPaid(event)) parts.push(formatKobo(event.priceKobo));

  return parts.join(" · ");
}

/** What the register action is called, so the button and the confirmation agree. */
export function eventAction(event: PublicEvent): string {
  return isPaid(event) ? "Reserve a place" : "Register free";
}

const NEARLY_FULL = 10;

/**
 * "Only 4 places left", or null. Shown only when places are genuinely low: a
 * counter reading "47 of 50 left" argues against you. Null capacity is unlimited.
 */
export function placesNote(item: Pick<PublicEvent | PublicProgram, "spotsRemaining" | "isFull">): string | null {
  const remaining = item.spotsRemaining;
  if (remaining === null || item.isFull || remaining > NEARLY_FULL) return null;
  return `Only ${remaining} ${remaining === 1 ? "place" : "places"} left`;
}
