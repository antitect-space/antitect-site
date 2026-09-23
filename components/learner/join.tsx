"use client";

import { Button } from "@/components/ui/button";
import { useNow } from "@/lib/use-now";

/**
 * The button that takes somebody into a live session.
 *
 * It is always there — a learner who wants in early should not have to wait
 * for a page to decide — but it goes loud from an hour before until the
 * session ends, which is the window in which it is the only thing on the page
 * anybody wants. The clock is the browser's; the server has no business
 * guessing what time it is where somebody is sitting.
 */
const OPENS_MS = 60 * 60 * 1000;

export function JoinButton({
  joinUrl,
  startsAt,
  endsAt,
  tone = "page",
  className,
}: {
  joinUrl: string;
  startsAt: string;
  endsAt: string | null;
  /** "ink" for the black panel, where an outline button is black on black. */
  tone?: "page" | "ink";
  className?: string;
}) {
  const now = useNow();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 2 * OPENS_MS;
  // Zero means the browser has not told us the time yet: stay quiet rather
  // than shouting about a session that may be days away.
  const live = now > 0 && now >= start - OPENS_MS && now <= end;

  const quiet = tone === "ink" ? "inverse" : "outline";

  return (
    <Button asChild size="lg" variant={live ? "default" : quiet} className={className}>
      <a href={joinUrl} target="_blank" rel="noopener noreferrer">
        {live ? "Join the session" : "Session link"}
      </a>
    </Button>
  );
}
