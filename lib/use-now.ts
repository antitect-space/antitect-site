"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, MINUTE);
  return () => clearInterval(id);
}

/**
 * The current time, to the minute, and zero on the server.
 *
 * Anything that depends on "now" has to be decided in the browser: pages are
 * cached for a minute at a time and a server-rendered "Tomorrow" would still
 * say so the next morning. Zero on the server keeps the first client render
 * identical to the HTML, so there is no hydration mismatch — callers treat
 * zero as "not known yet" and render the absolute facts instead.
 */
export function useNow(): number {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => 0,
  );
}
