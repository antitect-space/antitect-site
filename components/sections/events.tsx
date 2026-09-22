import Link from "next/link";

import { Fresh } from "@/components/live";
import { EventTicketRow } from "@/components/ticket";
import type { PublicEvent } from "@/lib/api";

/**
 * The same ticket language as the hero, laid out as a list. Rendered only when
 * something is actually coming: no empty state on the home page, by design.
 *
 * Every row is wrapped in `Fresh`, so a page served from a cache drops an
 * event that has since finished instead of advertising it.
 */
export function EventsSection({ events, hasMore }: { events: PublicEvent[]; hasMore: boolean }) {
  return (
    <section id="events" aria-labelledby="events-title" className="scroll-mt-4 border-b">
      <div className="container-page py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 id="events-title" className="text-display text-4xl sm:text-5xl">
            Upcoming events
          </h2>
          {hasMore ? (
            <Link href="/events" className="font-semibold underline underline-offset-4 hover:no-underline">
              See all events
            </Link>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 lg:mt-12">
          {events.map((event) => (
            <Fresh key={event.slug} startsAt={event.startsAt}>
              <EventTicketRow event={event} />
            </Fresh>
          ))}
        </div>
      </div>
    </section>
  );
}
