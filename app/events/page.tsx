import type { Metadata } from "next";
import Link from "next/link";

import { CutFrame } from "@/components/cut";
import { Fresh } from "@/components/live";
import { EventTicketRow } from "@/components/ticket";
import { Button } from "@/components/ui/button";
import { getUpcomingEvents } from "@/lib/api";
import { upcoming } from "@/lib/events";
import { shareMetadata } from "@/lib/metadata";

export const revalidate = 60;

const title = "Upcoming AI Events and Workshops";
const description =
  "Free AI webinars and hands-on workshops in Lagos and online. See what's coming up and reserve a place.";

export const metadata: Metadata = {
  title,
  ...shareMetadata({ title: `${title} — Antitect`, description, path: "/events" }),
};

export default async function EventsPage() {
  const events = upcoming(await getUpcomingEvents(25));

  return (
    <div className="container-page py-12 sm:py-16 lg:py-20">
      <h1 className="text-display text-5xl sm:text-6xl">Upcoming events</h1>
      <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
        Free webinars and hands-on workshops. Most people meet Antitect here.
      </p>

      {events.length > 0 ? (
        <div className="mt-12 grid gap-4">
          {events.map((event) => (
            <Fresh key={event.slug} startsAt={event.startsAt}>
              <EventTicketRow event={event} headingLevel="h2" />
            </Fresh>
          ))}
        </div>
      ) : (
        <CutFrame corner="tr" className="mt-12 max-w-2xl" innerClassName="p-6 sm:p-8">
          <p className="text-title text-2xl">Nothing scheduled right now.</p>
          <p className="mt-3 text-lg leading-[1.5] text-muted-foreground">
            Join the community and you will hear about the next one first.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/community">Join the community</Link>
          </Button>
        </CutFrame>
      )}
    </div>
  );
}
