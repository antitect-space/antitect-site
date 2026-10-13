import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/api";
import { eventHref, isPaid } from "@/lib/events";
import { firstSentence, formatDayShort, formatKobo, formatTimeRange } from "@/lib/format";

/**
 * "Also coming up" and "More upcoming webinars" (design W4, and "Workshop
 * row"): a hairline above the list and between rows. Each row gives the date
 * and time in WAT, the title and its promise line, and an outlined button.
 *
 * The rows read their own width, so the date column is 270px across the
 * page, 160px inside a detail page's content column, and stacked on a phone
 * with the button full width.
 */
export function EventList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <ul className="@container border-t border-rule">{children}</ul>
    </div>
  );
}

export function EventRow({ event, as: Heading = "h3" }: { event: PublicEvent; as?: "h3" | "h4" }) {
  const href = eventHref(event);
  const paid = isPaid(event);
  const action = paid ? "Reserve" : "Register";
  const promise = firstSentence(event.description);
  const venue = event.format === "in_person" ? (event.venue?.name ?? null) : null;

  return (
    <li className="grid gap-3 border-b border-rule py-6 @min-[600px]:grid-cols-[160px_minmax(0,1fr)_auto] @min-[600px]:gap-6 @min-[1000px]:grid-cols-[270px_minmax(0,564px)_minmax(0,1fr)_auto]">
      <p className="flex flex-wrap items-baseline gap-x-1.5 tabular-nums @min-[600px]:flex-col @min-[600px]:gap-0.5">
        <time dateTime={event.startsAt} className="type-small font-semibold text-ink">
          {formatDayShort(event.startsAt)}
        </time>
        <span className="type-meta font-medium text-ink-muted">
          <span aria-hidden="true" className="@min-[600px]:hidden">
            {"· "}
          </span>
          {formatTimeRange(event.startsAt)}
        </span>
      </p>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Heading className="type-h3 text-ink">
          <Link href={href} className="underline-offset-4 hover:underline">
            {event.title}
          </Link>
        </Heading>
        {venue || paid ? (
          <p className="type-small tabular-nums">
            {venue ? <span className="text-ink-muted">{venue}</span> : null}
            {venue && paid ? <span className="font-medium text-ink"> · </span> : null}
            {paid ? <span className="font-medium text-ink">{formatKobo(event.priceKobo)}</span> : null}
          </p>
        ) : null}
        {promise ? <p className={venue || paid ? "type-small text-ink-muted" : "type-body text-ink-muted"}>{promise}</p> : null}
      </div>

      <Button
        asChild
        variant="outline"
        className="mt-1 h-12 w-full px-4 @min-[600px]:mt-0 @min-[600px]:h-11 @min-[600px]:w-auto @min-[600px]:self-start @min-[1000px]:col-start-4"
      >
        <Link href={`${href}#register`} aria-label={`${action}: ${event.title}`}>
          {action}
        </Link>
      </Button>
    </li>
  );
}
