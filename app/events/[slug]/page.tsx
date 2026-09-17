import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentForm } from "@/components/forms/payment-form";
import { RegistrationForm } from "@/components/forms/registration-form";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { getEvent } from "@/lib/api";
import { eventLabel, isPaid, placesNote, registrationState } from "@/lib/events";
import { formatEventWhen, formatKobo, summarise } from "@/lib/format";
import { eventJsonLd, shareMetadata } from "@/lib/metadata";

/** Cached for a minute per slug; see app/page.tsx for why. */
export const revalidate = 60;

/** Nothing is built ahead of time. Each event page is rendered on first visit, then cached. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found", robots: { index: false } };

  const when = formatEventWhen(event.startsAt, event.endsAt);

  return {
    title: event.title,
    ...shareMetadata({
      title: event.title,
      // The date leads, because in a WhatsApp preview it is the thing people need.
      // Never the price: previews are cached long after it changes.
      description: summarise(`${when.date}, ${when.time}. ${event.description}`),
      path: `/events/${event.slug}`,
      imageUrl: event.imageUrl,
    }),
  };
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const when = formatEventWhen(event.startsAt, event.endsAt);
  const state = registrationState(event);
  const note = state === "open" ? placesNote(event) : null;

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:py-20">
      <JsonLd data={eventJsonLd(event)} />

      {/* Mobile order is title, form, then detail: the register action stays near the top. */}
      <header className="lg:col-start-1">
        <p className="text-[0.9375rem] font-medium text-muted-foreground">{eventLabel(event)}</p>
        <h1 className="text-display mt-3 text-[2.5rem] sm:text-6xl">{event.title}</h1>
        <p className="mt-6 text-xl leading-[1.4] font-semibold">
          {when.date}
          <br />
          {when.time}
        </p>
        {event.format === "in_person" && event.venue ? (
          <p className="mt-4 text-lg leading-[1.5]">
            <span className="font-semibold">{event.venue.name}</span>
            <br />
            <span className="text-muted-foreground">{event.venue.address}</span>
          </p>
        ) : null}
        {isPaid(event) ? <p className="mt-4 text-lg font-semibold">{formatKobo(event.priceKobo)}</p> : null}
        {note ? <p className="mt-3 font-medium">{note}</p> : null}
      </header>

      <div id="register" className="scroll-mt-4 self-start lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="border border-foreground p-6 sm:p-8">
          {state !== "open" ? (
            <Closed state={state} />
          ) : isPaid(event) ? (
            <PaymentForm
              payable={{ kind: "event", slug: event.slug }}
              title={event.title}
              priceKobo={event.priceKobo}
              closesAt={event.startsAt}
            />
          ) : (
            <RegistrationForm slug={event.slug} startsAt={event.startsAt} title={event.title} />
          )}
        </div>
      </div>

      <div className="lg:col-start-1">
        {event.imageUrl ? (
          <div className="relative mb-10 aspect-video w-full overflow-hidden bg-muted">
            <Image src={event.imageUrl} alt="" fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
          </div>
        ) : null}
        {event.description ? (
          <p className="max-w-[65ch] text-lg leading-[1.6] whitespace-pre-line">{event.description}</p>
        ) : null}

        {/* The webinar is the funnel: the next step is reachable without going home. */}
        <aside className="mt-12 border-t-2 border-foreground pt-6">
          <h2 className="text-title text-2xl">Want more than one session?</h2>
          <p className="mt-3 max-w-[56ch] leading-[1.6] text-muted-foreground">
            Our programmes run for weeks, with a one-to-one review of your project every week. You finish
            with things you built.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/programmes">See our programmes</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Closed({ state }: { state: "full" | "closed" }) {
  return (
    <div>
      <h2 className="text-title text-2xl">
        {state === "full" ? "Every place has been taken." : "This event has taken place."}
      </h2>
      <p className="mt-3 leading-[1.6] text-muted-foreground">
        {state === "full"
          ? "The next one will be on our events page. Join the community and you will hear about it first."
          : "Registration has closed. The next one will be on our events page."}
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/events">See upcoming events</Link>
      </Button>
    </div>
  );
}
