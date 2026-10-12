import type { PublicEvent, PublicProgram } from "./api";
import { formatKobo, hasStarted } from "./format";

/**
 * How long an event without an end time is taken to last. Two hours covers a
 * session in progress — long enough for somebody arriving late to see
 * "Happening now" rather than nothing, short enough that yesterday's webinar
 * never invites anybody to register.
 */
export const HAPPENING_NOW_MS = 2 * 60 * 60 * 1000;

type Timed = Pick<PublicEvent, "startsAt" | "endsAt">;

/**
 * When an event is over: at its end time when it has one, and otherwise two
 * hours after it starts. An end at or before the start is no end at all.
 */
export function endOf(event: Timed): number {
  const start = new Date(event.startsAt).getTime();
  const end = event.endsAt ? new Date(event.endsAt).getTime() : Number.NaN;
  return Number.isFinite(end) && end > start ? end : start + HAPPENING_NOW_MS;
}

/**
 * Past, as far as the site is concerned. Everything that lists events filters
 * through this, so a stale page or an API that ever starts returning finished
 * events cannot advertise one.
 */
export function isOver(event: Timed, now: number = Date.now()): boolean {
  return endOf(event) <= now;
}

/** "Live now": from the start until it is over. */
export function isLive(event: Timed, now: number = Date.now()): boolean {
  return hasStarted(event.startsAt, now) && !isOver(event, now);
}

export type EventPhase = "before" | "live" | "over";

/** Where an event stands at `now`. Decided in the browser wherever the page may be cached. */
export function eventPhase(event: Timed, now: number = Date.now()): EventPhase {
  if (!hasStarted(event.startsAt, now)) return "before";
  return isOver(event, now) ? "over" : "live";
}

/** Events worth showing: not finished, soonest first. */
export function upcoming(events: PublicEvent[], now: number = Date.now()): PublicEvent[] {
  return events
    .filter((event) => !isOver(event, now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** One type of event, keeping the order it came in. */
export function ofType(events: PublicEvent[], type: PublicEvent["type"]): PublicEvent[] {
  return events.filter((event) => event.type === type);
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
