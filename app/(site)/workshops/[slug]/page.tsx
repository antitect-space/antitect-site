import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Description } from "@/components/detail/description";
import { DetailLayout } from "@/components/detail/detail-layout";
import { EventHead } from "@/components/detail/event-head";
import { RegisterBar } from "@/components/detail/register-bar";
import { RegistrationPanel } from "@/components/detail/registration-panel";
import { ReservationPanel } from "@/components/detail/reservation-panel";
import { WhenAndWhere } from "@/components/detail/when-where";
import { EventList, EventRow } from "@/components/events/event-row";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { JsonLd } from "@/components/json-ld";
import { Fresh } from "@/components/live";
import { FaqList } from "@/components/sections/faq";
import { workshopFaqItems, workshopPage, workshopsPage } from "@/content/workshops";
import { getEvent, getUpcomingEvents, type PublicEvent } from "@/lib/api";
import { eventHref, eventPhase, isPaid, upcoming, workshopsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { firstParagraph, formatDayShort, formatKobo, formatShortWhen, leadAndRest, summarise } from "@/lib/format";
import { eventJsonLd, shareMetadata } from "@/lib/metadata";

/** Read again at most once a minute; what depends on the time is decided in the browser. */
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.type !== "workshop") return {};

  // Never a price: link previews are cached long after one changes.
  const description = summarise(firstParagraph(event.description), 155) || "A one-day workshop from Antitect.";
  return { title: event.title, ...shareMetadata({ title: event.title, description, path: eventHref(event) }) };
}

/**
 * A workshop's page (design "Workshop · Open", "Open · With flyer", and the
 * reservation panel's states in C7): the head and its sections in seven
 * columns, the panel in five. The panel is decided again in the browser, so
 * a cached page turns to "happening now" and "ended" on time.
 *
 * A webinar's slug is sent to its own page, permanently.
 */
export default async function WorkshopPage({ params }: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  if (event.type !== "workshop") permanentRedirect(eventHref(event));

  const [events, flyer] = await Promise.all([getUpcomingEvents(), flyerOf(event.imageUrl)]);
  const initialPhase = eventPhase(event);
  const others = upcoming(workshopsOf(events)).filter((workshop) => workshop.slug !== event.slug);
  const next = others[0] ?? null;
  const { lead, rest } = leadAndRest(event.description);
  const paid = isPaid(event);
  const faq = workshopFaqItems();

  // One community ask per page: full, or over with nothing next, the panel holds the form.
  const panelHoldsCommunity = (initialPhase === "before" && event.isFull) || (initialPhase === "over" && !next);

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <DetailLayout
        head={
          <EventHead
            event={event}
            label={`Workshop · ${event.format === "in_person" ? "In person" : "Online"}`}
            back={workshopPage.back}
            lead={lead}
            initialPhase={initialPhase}
          >
            <WhenAndWhere event={event} price />
          </EventHead>
        }
        panel={
          paid ? (
            <ReservationPanel event={event} initialPhase={initialPhase} next={next} />
          ) : (
            <RegistrationPanel event={event} initialPhase={initialPhase} next={next} />
          )
        }
      >
        {flyer ? <Flyer image={flyer} title={event.title} placement="detail" /> : null}

        {rest ? (
          <section aria-labelledby="build-title" className="flex flex-col gap-6">
            <h2 id="build-title" className="type-h2 text-ink">
              {workshopPage.build}
            </h2>
            <Description text={rest} />
          </section>
        ) : null}

        {faq.length > 0 ? (
          <section aria-labelledby="questions-title" className="flex flex-col gap-6 lg:gap-8">
            <h2 id="questions-title" className="type-h2 text-ink">
              {workshopsPage.faqTitle}
            </h2>
            <FaqList items={faq} openFirst narrow />
          </section>
        ) : null}

        {others.length > 0 ? (
          <section aria-labelledby="more-title" className="flex flex-col gap-6 lg:gap-8">
            <h2 id="more-title" className="type-h2 text-ink">
              {workshopPage.moreUpcoming}
            </h2>
            <EventList>
              {others.slice(0, 3).map((workshop) => (
                <Fresh key={workshop.slug} startsAt={workshop.startsAt} endsAt={workshop.endsAt}>
                  <EventRow event={workshop} />
                </Fresh>
              ))}
            </EventList>
          </section>
        ) : null}
      </DetailLayout>

      {panelHoldsCommunity ? null : <CloseSection quiet />}

      {initialPhase === "over" ? null : (
        <RegisterBar label={paid ? "Reserve your place" : "Register free"} lines={barLines(event)} />
      )}
    </>
  );
}

/** The date, with the price on a second line, so the bar holds at 360px. */
function barLines(event: PublicEvent): string[] {
  return isPaid(event) ? [formatDayShort(event.startsAt), formatKobo(event.priceKobo)] : [formatShortWhen(event.startsAt)];
}
