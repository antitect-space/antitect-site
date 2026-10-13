import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { Description } from "@/components/detail/description";
import { DetailLayout } from "@/components/detail/detail-layout";
import { EventHead } from "@/components/detail/event-head";
import { NextStep } from "@/components/detail/next-step";
import { RegisterBar } from "@/components/detail/register-bar";
import { RegistrationPanel } from "@/components/detail/registration-panel";
import { NextSessionCard } from "@/components/detail/side-card";
import { ReservationPanel } from "@/components/detail/reservation-panel";
import { WhenAndWhere } from "@/components/detail/when-where";
import { EventList, EventRow } from "@/components/events/event-row";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { JsonLd } from "@/components/json-ld";
import { Fresh } from "@/components/live";
import { RecordingCard } from "@/components/recording/recording-card";
import { RecordingPlayer } from "@/components/recording/recording-player";
import { FaqList } from "@/components/sections/faq";
import { webinarFaqItems, webinarPage, webinarsPage } from "@/content/webinars";
import { getEvent, getPastEvents, getUpcomingEvents, type PublicEvent } from "@/lib/api";
import { eventHref, eventLabel, eventPhase, isPaid, upcoming, webinarsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { firstParagraph, formatDateLong, formatDay, formatKobo, formatShortWhen, leadAndRest, summarise } from "@/lib/format";
import { eventJsonLd, shareMetadata } from "@/lib/metadata";
import { pastRecordings, recordingOf, type Recording } from "@/lib/recordings";

/** Read again at most once a minute; what depends on the time is decided in the browser. */
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/webinars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.type !== "webinar") return {};

  // Never a price: link previews are cached long after one changes.
  const description = summarise(firstParagraph(event.description), 155) || "A free live webinar from Antitect.";
  return { title: event.title, ...shareMetadata({ title: event.title, description, path: eventHref(event) }) };
}

/**
 * A webinar's page (design "Webinar · Open", "Registered", "Open · With
 * flyer", and the panel states in W5): the head and its sections in seven
 * columns, the panel in five. The panel is decided again in the browser, so
 * a cached page turns to "started" and "ended" on time.
 *
 * Once it is over and has a recording, the page becomes the recording page
 * (design "Webinar · Recording"). A workshop's slug is sent to its own page,
 * permanently.
 */
export default async function WebinarPage({ params }: PageProps<"/webinars/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();
  if (event.type !== "webinar") permanentRedirect(eventHref(event));

  const [events, past, flyer] = await Promise.all([getUpcomingEvents(), getPastEvents(), flyerOf(event.imageUrl)]);
  const initialPhase = eventPhase(event);
  const others = upcoming(webinarsOf(events)).filter((webinar) => webinar.slug !== event.slug);
  const next = others[0] ?? null;
  const recordings = pastRecordings(webinarsOf(past)).filter((item) => item.event.slug !== event.slug);
  const sample = recordings[0] ?? null;

  const recording = initialPhase === "over" ? recordingOf(event) : null;
  if (recording) {
    return <RecordingView event={event} recording={recording} next={next} more={recordings.slice(0, 3)} />;
  }

  const { lead, rest } = leadAndRest(event.description);
  const paid = isPaid(event);

  // One community ask per page: once it has ended with nothing next, the panel holds the form.
  const panelHoldsCommunity = initialPhase === "over" && !next;

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <DetailLayout
        head={
          <EventHead
            event={event}
            label={eventLabel(event)}
            back={webinarPage.back}
            lead={lead}
            initialPhase={initialPhase}
          >
            <WhenAndWhere event={event} />
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
          <section aria-labelledby="cover-title" className="flex flex-col gap-6">
            <h2 id="cover-title" className="type-h2 text-ink">
              {webinarPage.cover}
            </h2>
            <Description text={rest} />
          </section>
        ) : null}

        {sample ? (
          <section aria-labelledby="session-title" className="flex flex-col gap-5 lg:gap-6">
            <h2 id="session-title" className="type-h2 text-ink">
              {webinarPage.sessionLike}
            </h2>
            <figure className="flex flex-col gap-3">
              <RecordingPlayer
                recording={sample.recording}
                title={sample.event.title}
                sizes="(min-width: 1024px) 662px, 100vw"
              />
              <figcaption className="type-meta font-medium text-ink-muted tabular-nums">
                From {sample.event.title}, {formatDay(sample.event.startsAt)}
              </figcaption>
            </figure>
          </section>
        ) : null}

        <section aria-labelledby="questions-title" className="flex flex-col gap-6 lg:gap-8">
          <h2 id="questions-title" className="type-h2 text-ink">
            {webinarsPage.faqTitle}
          </h2>
          <FaqList items={webinarFaqItems({ recordings: sample !== null })} openFirst narrow />
        </section>

        <NextStep text={webinarPage.nextStep.text} links={webinarPage.nextStep.links} />

        {others.length > 0 ? (
          <section aria-labelledby="more-title" className="flex flex-col gap-6 lg:gap-8">
            <h2 id="more-title" className="type-h2 text-ink">
              {webinarPage.moreUpcoming}
            </h2>
            <EventList>
              {others.slice(0, 3).map((webinar) => (
                <Fresh key={webinar.slug} startsAt={webinar.startsAt} endsAt={webinar.endsAt}>
                  <EventRow event={webinar} />
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
 * The recording page (design "Webinar · Recording"): the recording in eight
 * columns, with what it covered and more recordings under it, and the next
 * webinar beside it, or the community form when nothing is scheduled. No
 * flyer here, and no register bar: there is nothing on this page to register
 * for.
 */
function RecordingView({
  event,
  recording,
  next,
  more,
}: {
  event: PublicEvent;
  recording: Recording;
  next: PublicEvent | null;
  more: ReadonlyArray<{ event: PublicEvent; recording: Recording }>;
}) {
  const label = `${isPaid(event) ? "Webinar" : "Free webinar"} · Recorded on ${formatDateLong(event.startsAt)}`;

  return (
    <>
      <JsonLd data={eventJsonLd(event)} />
      <DetailLayout
        split="recording"
        head={
          <div className="flex flex-col gap-6 lg:gap-16">
            <EventHead event={event} label={label} back={webinarPage.back} lead={null} initialPhase="over" status={false} />
            <RecordingPlayer recording={recording} title={event.title} preload />
          </div>
        }
        panel={<NextSessionCard next={next} type="webinar" />}
      >
        {event.description ? (
          <section aria-labelledby="covered-title" className="flex flex-col gap-5 lg:gap-6">
            <h2 id="covered-title" className="type-h2 text-ink">
              {webinarPage.covered}
            </h2>
            <Description text={event.description} />
          </section>
        ) : null}

        {more.length > 0 ? (
          <section aria-labelledby="more-recordings-title" className="flex flex-col gap-6 lg:gap-8">
            <h2 id="more-recordings-title" className="type-h2 text-ink">
              {webinarPage.moreRecordings}
            </h2>
            <ul className="grid gap-10 lg:grid-cols-3 lg:gap-6">
              {more.map((item) => (
                <li key={item.event.slug}>
                  <RecordingCard event={item.event} recording={item.recording} sizes="(min-width: 1024px) 237px, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </DetailLayout>

      {/* One community ask per page: with nothing next, the side card holds the form. */}
      {next ? <CloseSection quiet /> : null}
    </>
  );
}

/** The date and time, with the price on a second line when there is one. */
function barLines(event: PublicEvent): string[] {
  return isPaid(event) ? [formatShortWhen(event.startsAt), formatKobo(event.priceKobo)] : [formatShortWhen(event.startsAt)];
}
