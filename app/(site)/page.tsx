import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { CommunitySection } from "@/components/sections/community";
import { EventsSection } from "@/components/sections/events";
import { FaqSection } from "@/components/sections/faq";
import { GallerySection } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { LoopSection } from "@/components/sections/loop";
import { PremiseSection } from "@/components/sections/premise";
import { ProgrammesSection } from "@/components/sections/programmes";
import { WhySection } from "@/components/sections/why";
import { generalFaq } from "@/content/faq";
import { getPrograms, getUpcomingEvents } from "@/lib/api";
import { upcoming } from "@/lib/events";
import { organizationJsonLd, shareMetadata } from "@/lib/metadata";
import { enrolmentState } from "@/lib/programs";
import { SITE_DESCRIPTION } from "@/lib/site";

/**
 * Regenerated at most once a minute. That keeps the site inside the API's
 * read limit, and it is why a change saved in the CRM shows here within about
 * a minute with no deploy. Anything that depends on the current time is
 * decided in the browser instead, because a cached page cannot be trusted to
 * know what "today" is.
 */
export const revalidate = 60;

const title = "Practical AI Training in Nigeria — Antitect";

export const metadata: Metadata = {
  title: { absolute: title },
  ...shareMetadata({ title, description: SITE_DESCRIPTION, path: "/" }),
};

const EVENTS_ON_HOME = 3;

export default async function HomePage() {
  const [events, programs] = await Promise.all([getUpcomingEvents(EVENTS_ON_HOME + 1), getPrograms()]);

  // One guard for the whole page: nothing that has finished is ever upcoming.
  const live = upcoming(events);
  const nextProgram = programs.find((program) => enrolmentState(program) === "open") ?? programs[0] ?? null;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero event={live[0] ?? null} program={nextProgram} />
      <PremiseSection />
      <GallerySection />
      <LoopSection />
      {live.length > 0 ? (
        <EventsSection events={live.slice(0, EVENTS_ON_HOME)} hasMore={live.length > EVENTS_ON_HOME} />
      ) : null}
      {programs.length > 0 ? <ProgrammesSection programs={programs} /> : null}
      <WhySection />
      {/* The section below is notched, and climbs into this one. */}
      <FaqSection items={generalFaq} className="notch-clearance" />
      <CommunitySection />
    </>
  );
}
