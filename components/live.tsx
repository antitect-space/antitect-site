"use client";

import type { ReactNode } from "react";

import { endOf, eventPhase, type EventPhase } from "@/lib/events";
import { relativeLabel } from "@/lib/format";
import { useNow } from "@/lib/use-now";

/**
 * Everything here is worked out in the browser. A page is cached for a minute
 * at a time, so the server cannot be trusted to know what "now" is: one cached
 * at noon would still say "Tomorrow" the next morning. The absolute date and
 * time are always in the HTML beside these, so a page reads correctly with or
 * without JavaScript.
 *
 * An event is over at its end time, or two hours after it starts when it has
 * none (`endOf` in lib/events.ts). `endsAt` is optional throughout: the
 * learner and tutor areas pass only a start, and read as they always have.
 */

/** "In 3 days", "Tomorrow", "Today · starts 10:00 am", "Happening now". */
export function RelativeLabel({
  startsAt,
  endsAt = null,
  className,
}: {
  startsAt: string;
  endsAt?: string | null;
  className?: string;
}) {
  const now = useNow();
  if (!now) return null;

  const label = relativeLabel(startsAt, now, endOf({ startsAt, endsAt }));
  if (!label) return null;

  return <span className={className}>{label}</span>;
}

/**
 * Swaps an action out once the event has started.
 *
 * Registration closes the moment an event begins — the API refuses it — so a
 * cached page must not keep offering it. The server renders the action, and
 * the browser replaces it as soon as it knows the time.
 */
export function Started({
  startsAt,
  children,
  fallback,
}: {
  startsAt: string;
  children: ReactNode;
  fallback: ReactNode;
}) {
  const now = useNow();
  const started = now > 0 && new Date(startsAt).getTime() <= now;
  return <>{started ? fallback : children}</>;
}

/**
 * Hides something whose moment has passed, and offers whatever comes next.
 *
 * The server already filters finished events, but a page can sit in the cache
 * or in a phone's back-forward cache for longer than that. This is the last
 * guard: once the browser knows the time, a finished event stops being an
 * invitation to register.
 */
export function Fresh({
  startsAt,
  endsAt = null,
  children,
  fallback = null,
}: {
  startsAt: string;
  endsAt?: string | null;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const now = useNow();
  const over = now > 0 && endOf({ startsAt, endsAt }) <= now;
  return <>{over ? fallback : children}</>;
}

/**
 * Where an event stands, before it starts, while it is on, or once it is
 * over. `null` until the browser knows the time, so the first render matches
 * the server's HTML; callers then show what the server decided.
 */
export function useEventPhase(startsAt: string, endsAt: string | null): EventPhase | null {
  const now = useNow();
  return now ? eventPhase({ startsAt, endsAt }, now) : null;
}
