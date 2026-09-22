import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Cut, CutFrame } from "@/components/cut";
import { PaymentForm } from "@/components/forms/payment-form";
import { RegistrationForm } from "@/components/forms/registration-form";
import { JsonLd } from "@/components/json-ld";
import { EventTicket } from "@/components/ticket";
import { Button } from "@/components/ui/button";
import { getEvent } from "@/lib/api";
import { eventAction, isOver, isPaid, registrationState } from "@/lib/events";
import { formatEventWhen, summarise } from "@/lib/format";
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
      // The date leads: in a WhatsApp preview it is the thing people need.
      // Never the price, which the preview would keep long after it changed.
      title: event.title,
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

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:py-16">
      <JsonLd data={eventJsonLd(event)} />

      {/* The ticket leads, and carries the h1: format, title, date, and the action. */}
      <div className="lg:col-start-1">
        <EventTicket
          event={event}
          headingLevel="h1"
          action={{ href: "#register", label: eventAction(event) }}
          next={{ href: "/events", label: "See upcoming events" }}
        />

        <dl className="mt-8 grid gap-4 border-t-2 border-foreground pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-[0.9375rem] font-semibold text-muted-foreground">When</dt>
            <dd className="mt-1 text-lg leading-[1.4] font-semibold">
              {when.date}
              <br />
              {when.time}
            </dd>
          </div>
          <div>
            <dt className="text-[0.9375rem] font-semibold text-muted-foreground">Where</dt>
            <dd className="mt-1 text-lg leading-[1.4]">
              {event.format === "in_person" && event.venue ? (
                <>
                  <span className="font-semibold">{event.venue.name}</span>
                  <br />
                  <span className="text-muted-foreground">{event.venue.address}</span>
                </>
              ) : (
                <span className="font-semibold">Online</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* The form sits beside the ticket on a desktop, and directly under it on a phone. */}
      <div
        id="register"
        className="scroll-mt-4 self-start lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1"
      >
        <CutFrame corner="bl" innerClassName="p-6 sm:p-8">
          {state !== "open" ? (
            <Closed state={state} running={state === "closed" && !isOver(event)} />
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
        </CutFrame>
      </div>

      <div className="lg:col-start-1">
        {event.imageUrl ? (
          <Cut corner="tr" className="relative mb-8 aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={event.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="object-cover"
            />
          </Cut>
        ) : null}

        {event.description ? (
          <p className="max-w-[62ch] text-lg leading-[1.6] whitespace-pre-line">{event.description}</p>
        ) : null}

        <aside className="mt-10 border-t-2 border-foreground pt-6">
          <p className="text-lg font-semibold">Want more than one session?</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/programmes">See our programmes</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Closed({ state, running }: { state: "full" | "closed"; running: boolean }) {
  const heading = state === "full" ? "Every place has been taken." : running ? "This is happening now." : "This event has taken place.";

  return (
    <div>
      <h2 className="text-title text-2xl">{heading}</h2>
      <p className="mt-3 leading-[1.6] text-muted-foreground">
        {state === "full"
          ? "The next one is on our events page."
          : running
            ? "Registration has closed for this one. The next is on our events page."
            : "Registration has closed. The next one is on our events page."}
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/events">See upcoming events</Link>
      </Button>
    </div>
  );
}
