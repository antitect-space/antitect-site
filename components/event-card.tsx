import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/api";
import { eventAction, eventLabel, placesNote } from "@/lib/events";
import { formatEventWhen } from "@/lib/format";

/** Title, when (zone named), format and price, and the action. Places only when genuinely low. */
export function EventCard({ event, headingLevel = "h3" }: { event: PublicEvent; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const when = formatEventWhen(event.startsAt, event.endsAt);
  const note = placesNote(event);

  return (
    <article className="flex flex-col justify-between gap-8 border border-border bg-background p-6 sm:p-7">
      <div>
        <p className="text-[0.9375rem] font-medium text-muted-foreground">{eventLabel(event)}</p>
        <Heading className="text-title mt-3 text-2xl">
          <Link href={`/events/${event.slug}`} className="hover:underline hover:underline-offset-4">
            {event.title}
          </Link>
        </Heading>
        <p className="mt-4 leading-[1.5] font-medium">
          {when.date}
          <br />
          {when.time}
        </p>
        {event.format === "in_person" && event.venue ? (
          <p className="mt-2 leading-[1.5] text-muted-foreground">{event.venue.name}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {event.isFull ? (
          <p className="font-semibold">Every place has been taken.</p>
        ) : (
          <Button asChild variant="outline">
            <Link href={`/events/${event.slug}`} aria-label={`${eventAction(event)}: ${event.title}`}>
              {eventAction(event)}
            </Link>
          </Button>
        )}
        {note ? <p className="text-[0.9375rem] font-medium">{note}</p> : null}
      </div>
    </article>
  );
}
