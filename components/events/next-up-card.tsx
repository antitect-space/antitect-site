import Link from "next/link";

import { RelativeLabel } from "@/components/live";
import { Button } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/api";
import { eventHref, isPaid, placesNote } from "@/lib/events";
import {
  firstSentence,
  formatDateLong,
  formatDayShort,
  formatKobo,
  formatLength,
  formatTimeRange,
  formatWeekday,
  ticketDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The soonest webinar or workshop, across the content width (design W3, and
 * "Next workshop card"): the facts on the left, the date large and the one
 * red button on the right; stacked on a phone, the button full width.
 *
 * The meta line's second half ("In 9 days", "Tomorrow", "Today · starts
 * 10:00 am") is worked out in the browser; everything else is in the HTML.
 * A webinar gives its date in full and its length, when it has an end time;
 * a workshop its short date, venue and price.
 */
export function NextUpCard({
  event,
  label,
  as: Heading = "h2",
  flyer,
  className,
}: {
  event: PublicEvent;
  /** "Next up", "Next workshop". */
  label: string;
  as?: "h2" | "h3";
  /** The event's flyer, when it has one: a `<Flyer placement="card">`. */
  flyer?: React.ReactNode;
  className?: string;
}) {
  const href = eventHref(event);
  const paid = isPaid(event);
  const action = paid ? "Reserve your place" : "Register free";
  const places = placesNote(event);
  const promise = firstSentence(event.description);
  const date = ticketDate(event.startsAt);
  const workshop = event.type === "workshop";

  const venue = event.format === "in_person" ? (event.venue?.name ?? null) : null;
  const details = [
    formatTimeRange(event.startsAt, event.endsAt),
    workshop ? null : formatLength(event.startsAt, event.endsAt),
    venue,
    paid ? formatKobo(event.priceKobo) : null,
  ].filter(Boolean);

  const text = (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="type-meta flex items-center gap-2 font-semibold text-ink">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink" />
        <span>
          {label}
          <RelativeLabel startsAt={event.startsAt} endsAt={event.endsAt} prefix=" · " />
        </span>
      </p>
      <Heading className="type-h2 text-ink">
        <Link href={href} className="underline-offset-4 hover:underline">
          {event.title}
        </Link>
      </Heading>
      {promise ? <p className="type-lead text-ink">{promise}</p> : null}
      <p className="type-body pt-2 font-medium text-ink tabular-nums">
        <time dateTime={event.startsAt}>
          {workshop ? formatDayShort(event.startsAt) : formatDateLong(event.startsAt)}
        </time>
        {/* On a phone the date has a line to itself. */}
        <span aria-hidden="true" className="max-lg:hidden">
          {" · "}
        </span>
        <span className="max-lg:block">{details.join(" · ")}</span>
      </p>
    </div>
  );

  // The same date as the line above, drawn large; read once is enough.
  const bigDate = (
    <p aria-hidden="true" className="flex items-center gap-3">
      <span className="type-h2 text-ink tabular-nums">{date.day}</span>
      <span className="type-meta flex flex-col">
        <span className="font-semibold text-ink">{date.month}</span>
        <span className="font-medium text-ink-muted">{formatWeekday(event.startsAt)}</span>
      </span>
    </p>
  );

  const register = (
    <div className="flex flex-col gap-3">
      <Button asChild size="lg" className="w-full px-5">
        <Link href={`${href}#register`} aria-label={`${action}: ${event.title}`}>
          {action}
        </Link>
      </Button>
      {places ? <p className="type-meta font-medium text-ink-muted tabular-nums">{places}</p> : null}
    </div>
  );

  const box = "grid gap-6 rounded-md border border-field-border bg-paper p-6 lg:p-10";

  if (flyer) {
    // The flyer takes the left four columns (the top, on a phone); it never touches the red button.
    return (
      <article className={cn(box, "lg:grid-cols-[368fr_680fr]", className)}>
        <div className="min-w-0">{flyer}</div>
        <div className="flex min-w-0 flex-col gap-6">
          {text}
          <div className="flex flex-col gap-5 border-t border-rule pt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:pt-6">
            {bigDate}
            <div className="lg:w-[328px]">{register}</div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(box, "lg:grid-cols-[720fr_328fr]", className)}>
      {text}
      <div className="flex flex-col gap-5 border-t border-rule pt-5 lg:justify-between lg:gap-6 lg:border-0 lg:pt-0">
        {bigDate}
        {register}
      </div>
    </article>
  );
}
