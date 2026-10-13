import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { PublicEvent, Venue } from "@/lib/api";
import { directionsUrl, isPaid } from "@/lib/events";
import { formatDateLong, formatEventWhen, formatKobo, formatLength } from "@/lib/format";

/**
 * "When and where" on a webinar's page (design W9), and "When, where and
 * price" on a workshop's (C8): columns between hairlines on a desktop,
 * stacked rows on a phone. The time is written in full, in West Africa Time;
 * the length only shows with an end time. An online session's Where reads
 * "Online", with no address. Never a joining link.
 */
export function WhenAndWhere({
  event,
  price = false,
}: {
  event: Pick<PublicEvent, "startsAt" | "endsAt" | "format" | "venue" | "priceKobo">;
  /** Workshops show the price as a third column. */
  price?: boolean;
}) {
  const showPrice = price && isPaid(event);
  const venue = event.format === "in_person" ? event.venue : null;

  return (
    <dl
      className={
        "flex flex-col border-t border-rule lg:grid lg:gap-6 lg:border-b lg:py-5 " +
        (showPrice ? "lg:grid-cols-[247fr_247fr_120fr]" : "lg:grid-cols-[416fr_120fr]")
      }
    >
      <Column label="When">
        <span className="block font-semibold text-ink">
          <time dateTime={event.startsAt}>{formatDateLong(event.startsAt)}</time>
        </span>
        <span className="block text-ink-muted tabular-nums">{fullTime(event.startsAt, event.endsAt)}</span>
      </Column>
      <Column label="Where">{venue ? <VenueBlock venue={venue} /> : <span className="font-semibold text-ink">Online</span>}</Column>
      {showPrice ? (
        <Column label="Price">
          <span className="font-semibold text-ink tabular-nums">{formatKobo(event.priceKobo)}</span>
        </Column>
      ) : null}
    </dl>
  );
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-rule py-4 lg:border-0 lg:py-0">
      <dt className="type-meta font-medium text-ink-muted">{label}</dt>
      <dd className="type-body">{children}</dd>
    </div>
  );
}

/** "10:00 am – 4:00 pm West Africa Time · 6 hours", in full for a detail page. */
function fullTime(startsAt: string, endsAt: string | null): string {
  const length = formatLength(startsAt, endsAt);
  const { time } = formatEventWhen(startsAt, endsAt);
  return length ? `${time} · ${length}` : time;
}

/** A venue (design C1): its name, its address and "Get directions", which opens Google Maps on it. */
export function VenueBlock({ venue }: { venue: Venue }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-semibold text-ink">{venue.name}</span>
      {venue.address ? <span className="text-ink-muted">{venue.address}</span> : null}
      <Button asChild variant="text" className="self-start">
        <a href={directionsUrl(venue)} target="_blank" rel="noopener noreferrer">
          Get directions
          <ArrowRight />
        </a>
      </Button>
    </span>
  );
}
