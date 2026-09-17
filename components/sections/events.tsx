import Link from "next/link";

import { EventCard } from "@/components/event-card";
import type { PublicEvent } from "@/lib/api";

/** Rendered only when there is at least one upcoming event. No empty state on the home page, by design. */
export function EventsSection({ events, hasMore }: { events: PublicEvent[]; hasMore: boolean }) {
  return (
    <section id="events" aria-labelledby="events-title" className="scroll-mt-4 border-b">
      <div className="container-page py-16 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <h2 id="events-title" className="text-display text-4xl sm:text-5xl">
              Upcoming events
            </h2>
            <p className="mt-6 max-w-[62ch] text-lg leading-[1.6] text-muted-foreground">
              Free webinars and hands-on workshops, run regularly. Most people meet Antitect here.
            </p>
          </div>
          {hasMore ? (
            <Link href="/events" className="font-semibold underline underline-offset-4 hover:no-underline">
              See all events
            </Link>
          ) : null}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
