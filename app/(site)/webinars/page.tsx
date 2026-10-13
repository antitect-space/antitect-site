import type { Metadata } from "next";

import { GoFurther } from "@/components/detail/go-further";
import { ListingHeader, NothingScheduled } from "@/components/detail/listing";
import { EventList, EventRow } from "@/components/events/event-row";
import { NextUpCard } from "@/components/events/next-up-card";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { Fresh } from "@/components/live";
import { RecordingGrid } from "@/components/recording/recording-grid";
import { FaqSection } from "@/components/sections/faq";
import { formats } from "@/content/formats";
import { webinarFaqItems, webinarsPage } from "@/content/webinars";
import { getPastEvents, getUpcomingEvents } from "@/lib/api";
import { upcoming, webinarsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { shareMetadata } from "@/lib/metadata";
import { pastRecordings } from "@/lib/recordings";

/** Read again at most once a minute, like every page built from the CRM. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: webinarsPage.title,
  ...shareMetadata({ title: webinarsPage.title, description: webinarsPage.description, path: "/webinars" }),
};

/**
 * The webinars page (design "Webinars · Default", "Nothing scheduled" and
 * "With flyer"): the next webinar, the rest coming up, past sessions to
 * watch, the deeper formats, questions, and the community.
 *
 * With nothing scheduled, the community form takes the next webinar's place
 * and the community band goes: one ask for the community per page.
 */
export default async function WebinarsPage() {
  const [events, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);
  const webinars = upcoming(webinarsOf(events));
  const [next, ...also] = webinars;
  const recordings = pastRecordings(webinarsOf(past));
  const flyer = next ? await flyerOf(next.imageUrl) : null;

  return (
    <>
      <ListingHeader title={webinarsPage.title} lead={webinarsPage.lead} facts={webinarsPage.facts} rings />

      {next ? (
        <>
          <section aria-label={webinarsPage.nextUp} className="container-site pb-14 lg:pb-16">
            {/* Gone once it is over, even from a cached page. */}
            <Fresh startsAt={next.startsAt} endsAt={next.endsAt}>
              <NextUpCard
                event={next}
                label={webinarsPage.nextUp}
                flyer={flyer ? <Flyer image={flyer} title={next.title} placement="card" /> : null}
              />
            </Fresh>
          </section>

          {also.length > 0 ? (
            <section aria-labelledby="also-title" className="container-site flex flex-col gap-6 pb-16 lg:gap-8 lg:pb-28">
              <h2 id="also-title" className="type-h2 text-ink">
                {webinarsPage.also}
              </h2>
              <EventList>
                {also.map((webinar) => (
                  <Fresh key={webinar.slug} startsAt={webinar.startsAt} endsAt={webinar.endsAt}>
                    <EventRow event={webinar} />
                  </Fresh>
                ))}
              </EventList>
            </section>
          ) : null}
        </>
      ) : (
        <NothingScheduled title={webinarsPage.nothing.title} line={webinarsPage.nothing.line} />
      )}

      {recordings.length > 0 ? (
        <>
          <hr className="border-rule" />
          <section aria-labelledby="past-title" className="section-pad">
            <div className="container-site flex flex-col gap-8 lg:gap-12">
              <div className="flex flex-col gap-3 lg:gap-4">
                <h2 id="past-title" className="type-h2 text-ink">
                  {webinarsPage.past.title}
                </h2>
                <p className="type-lead text-ink-muted">{webinarsPage.past.line}</p>
              </div>
              <RecordingGrid items={recordings} more={webinarsPage.past.more} />
            </div>
          </section>
        </>
      ) : null}

      <hr className="border-rule" />
      <GoFurther
        title={webinarsPage.goFurther}
        items={[
          { format: formats.workshops, link: { label: "See workshops", href: "/workshops" } },
          { format: formats.programmes, link: { label: "See programmes", href: "/programmes" } },
        ]}
      />

      <hr className="border-rule" />
      <FaqSection
        id="webinar-faq"
        title={webinarsPage.faqTitle}
        items={webinarFaqItems({ recordings: recordings.length > 0 })}
        openFirst
      />

      {next ? <CloseSection quiet /> : null}
    </>
  );
}
