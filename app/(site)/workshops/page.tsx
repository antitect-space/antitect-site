import type { Metadata } from "next";

import { GoFurther } from "@/components/detail/go-further";
import { ListingHeader, NothingScheduled } from "@/components/detail/listing";
import { EventList, EventRow } from "@/components/events/event-row";
import { NextUpCard } from "@/components/events/next-up-card";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { Fresh } from "@/components/live";
import { FaqSection } from "@/components/sections/faq";
import { RecapCard } from "@/components/workshop/recap";
import { recapsNewestFirst } from "@/content/recaps";
import { workshopFaqItems, workshopsGoFurther, workshopsPage } from "@/content/workshops";
import { getUpcomingEvents } from "@/lib/api";
import { upcoming, workshopsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { shareMetadata } from "@/lib/metadata";

/** Read again at most once a minute, like every page built from the CRM. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: workshopsPage.title,
  ...shareMetadata({ title: workshopsPage.title, description: workshopsPage.description, path: "/workshops" }),
};

/**
 * The workshops page (design "Workshops · Default", "Nothing scheduled" and
 * "With flyer"): the next workshop, the rest coming up, past workshops, the
 * deeper formats, questions, and the community.
 *
 * With nothing scheduled, the community form takes the next workshop's place
 * and the community band goes: one ask for the community per page.
 */
export default async function WorkshopsPage() {
  const events = await getUpcomingEvents();
  const [next, ...also] = upcoming(workshopsOf(events));
  const flyer = next ? await flyerOf(next.imageUrl) : null;
  const faq = workshopFaqItems();
  const recaps = recapsNewestFirst();

  return (
    <>
      <ListingHeader title={workshopsPage.title} lead={workshopsPage.lead} facts={workshopsPage.facts} />

      {next ? (
        <>
          <section aria-label={workshopsPage.nextUp} className="container-site pb-14 lg:pb-16">
            {/* Gone once it is over, even from a cached page. */}
            <Fresh startsAt={next.startsAt} endsAt={next.endsAt}>
              <NextUpCard
                event={next}
                label={workshopsPage.nextUp}
                flyer={flyer ? <Flyer image={flyer} title={next.title} placement="card" /> : null}
              />
            </Fresh>
          </section>

          {also.length > 0 ? (
            <section aria-labelledby="also-title" className="container-site flex flex-col gap-6 pb-16 lg:gap-8 lg:pb-28">
              <h2 id="also-title" className="type-h2 text-ink">
                {workshopsPage.also}
              </h2>
              <EventList>
                {also.map((workshop) => (
                  <Fresh key={workshop.slug} startsAt={workshop.startsAt} endsAt={workshop.endsAt}>
                    <EventRow event={workshop} />
                  </Fresh>
                ))}
              </EventList>
            </section>
          ) : null}
        </>
      ) : (
        <NothingScheduled title={workshopsPage.nothing.title} line={workshopsPage.nothing.line} />
      )}

      {recaps.length > 0 ? (
        <>
          <hr className="border-rule" />
          <section aria-labelledby="past-title" className="section-pad">
            <div className="container-site flex flex-col gap-8 lg:gap-10">
              <h2 id="past-title" className="type-h2 text-ink">
                {workshopsPage.past}
              </h2>
              <ul className="flex flex-col gap-12">
                {recaps.map((recap) => (
                  <li key={recap.slug}>
                    <RecapCard recap={recap} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      ) : null}

      <hr className="border-rule" />
      <GoFurther title={workshopsPage.goFurther} items={workshopsGoFurther} />

      {faq.length > 0 ? (
        <>
          <hr className="border-rule" />
          <FaqSection id="workshop-faq" title={workshopsPage.faqTitle} items={faq} openFirst />
        </>
      ) : null}

      {next ? <CloseSection quiet /> : null}
    </>
  );
}
