"use client";

import type { ReactNode } from "react";

import { HAPPENING_NOW_MS } from "@/lib/events";
import { relativeLabel } from "@/lib/format";
import { useNow } from "@/lib/use-now";

/**
 * "In 3 days", "Tomorrow", "Happening now" — worked out in the browser.
 *
 * Nothing renders on the server, because a relative label inside a cached
 * page goes stale: one cached at noon would still say "Tomorrow" the next
 * morning. The absolute date and time are always in the HTML beside this, so
 * the ticket reads correctly with or without JavaScript.
 */
export function RelativeLabel({ startsAt, className }: { startsAt: string; className?: string }) {
  const now = useNow();
  if (!now) return null;

  const label = relativeLabel(startsAt, now, HAPPENING_NOW_MS);
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
  children,
  fallback = null,
}: {
  startsAt: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const now = useNow();
  const over = now > 0 && new Date(startsAt).getTime() + HAPPENING_NOW_MS <= now;
  return <>{over ? fallback : children}</>;
}
