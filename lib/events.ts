import type { PublicEvent, PublicProgram } from "./api";
import { formatKobo, hasStarted } from "./format";

/**
 * How long an event stays on the site after it starts.
 *
 * The API sends a start time and, for now, nothing that says when an event
 * actually ends, so the site cannot know it is over. Two hours covers a
 * session in progress — long enough for somebody arriving late to see
 * "Happening now" rather than nothing, short enough that yesterday's webinar
 * never invites anybody to register.
 */
export const HAPPENING_NOW_MS = 2 * 60 * 60 * 1000;

/**
 * Past, as far as the site is concerned. Everything that lists events filters
 * through this, so a stale page or an API that ever starts returning finished
 * events cannot advertise one.
 */
export function isOver(event: Pick<PublicEvent, "startsAt">, now: number = Date.now()): boolean {
  return new Date(event.startsAt).getTime() + HAPPENING_NOW_MS <= now;
}

/** Events worth showing: not finished, soonest first. */
export function upcoming(events: PublicEvent[], now: number = Date.now()): PublicEvent[] {
  return events
    .filter((event) => !isOver(event, now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

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

/** Below a fifth of the places left, it is worth saying. Above it, "47 of 50 left" argues against you. */
const LOW_FRACTION = 0.2;

/** "12 places left", or null. Null capacity means unlimited, not zero. */
export function placesNote(
  item: Pick<PublicEvent | PublicProgram, "spotsRemaining" | "capacity" | "isFull">,
): string | null {
  const { spotsRemaining: remaining, capacity } = item;
  if (remaining === null || capacity === null || item.isFull) return null;
  if (remaining > Math.max(1, Math.ceil(capacity * LOW_FRACTION))) return null;
  return `${remaining} ${remaining === 1 ? "place" : "places"} left`;
}
