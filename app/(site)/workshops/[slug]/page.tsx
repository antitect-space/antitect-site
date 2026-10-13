import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { BackLink } from "@/components/detail/back-link";
import { Description } from "@/components/detail/description";
import { DetailLayout } from "@/components/detail/detail-layout";
import { EventHead } from "@/components/detail/event-head";
import { RegisterBar } from "@/components/detail/register-bar";
import { RegistrationPanel } from "@/components/detail/registration-panel";
import { ReservationPanel } from "@/components/detail/reservation-panel";
import { NextSessionCard } from "@/components/detail/side-card";
import { WhenAndWhere } from "@/components/detail/when-where";
import { EventList, EventRow } from "@/components/events/event-row";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { JsonLd } from "@/components/json-ld";
import { Fresh } from "@/components/live";
import { FaqList } from "@/components/sections/faq";
import { PastWorkshopStrip, RecapFigures, RecapGallery, RecapQuotes } from "@/components/workshop/recap";
import { recapOf, recapPage, recapsNewestFirst, type Recap } from "@/content/recaps";
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

  const recap = recapOf(slug);
  if (recap) {
    // No city here: the place belongs on the page, beside the event it names.
    return { title: recap.name, ...shareMetadata({ title: recap.name, description: recapPage.description, path: `/workshops/${recap.slug}` }) };
  }

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
 * A workshop that has happened and has a recap (content/recaps.ts) is its
 * recap page instead, with no API read for the workshop itself. A webinar's
 * slug is sent to its own page, permanently.
 */
export default async function WorkshopPage({ params }: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;

  const recap = recapOf(slug);
  if (recap) {
    const next = upcoming(workshopsOf(await getUpcomingEvents()))[0] ?? null;
    return <RecapView recap={recap} next={next} />;
  }

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
  const past = recapsNewestFirst()[0] ?? null;

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

        {past ? (
          <section aria-labelledby="past-title" className="flex flex-col gap-5 lg:gap-6">
            <h2 id="past-title" className="type-h2 text-ink">
              {workshopPage.pastWorkshop}
            </h2>
            <PastWorkshopStrip recap={past} />
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

/**
 * A workshop's recap (design "Workshop · Recap"): where and when it was, the
 * figures once they are confirmed, every photograph, and what people built;
 * the next workshop beside it, or the community form when nothing is
 * scheduled, in which case the community band goes.
 */
function RecapView({ recap, next }: { recap: Recap; next: PublicEvent | null }) {
  return (
    <>
      <DetailLayout
        head={
          <div className="flex flex-col gap-8 lg:gap-10">
            <div className="flex flex-col gap-4 lg:gap-6">
              <BackLink href={workshopPage.back.href} label={workshopPage.back.label} />
              <div className="flex flex-col gap-3 lg:gap-4">
                <p className="type-meta font-medium text-ink-muted">
                  Workshop · {recap.place} · <time dateTime={recap.dateTime}>{recap.date}</time>
                </p>
                <h1 className="type-h1 text-ink">{recap.name}</h1>
                {recap.people !== null && recap.people > 0 ? (
                  <p className="type-lead max-w-[600px] text-ink-muted">
                    {recap.people} {recap.leadAfterHeadcount}
                  </p>
                ) : null}
              </div>
            </div>
            <RecapFigures recap={recap} />
          </div>
        }
        panel={<NextSessionCard next={next} type="workshop" />}
      >
        <section aria-label={`Photographs from ${recap.name}`}>
          <RecapGallery recap={recap} />
        </section>
        <RecapQuotes recap={recap} title={recapPage.built} />
      </DetailLayout>

      {/* One community ask per page: with nothing next, the side card holds the form. */}
      {next ? <CloseSection quiet /> : null}
    </>
  );
}

/** The date, with the price on a second line, so the bar holds at 360px. */
function barLines(event: PublicEvent): string[] {
  return isPaid(event) ? [formatDayShort(event.startsAt), formatKobo(event.priceKobo)] : [formatShortWhen(event.startsAt)];
}
