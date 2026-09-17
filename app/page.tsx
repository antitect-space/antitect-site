import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { CommunitySection } from "@/components/sections/community";
import { EventsSection } from "@/components/sections/events";
import { FaqSection } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { MethodSection } from "@/components/sections/method";
import { PremiseSection } from "@/components/sections/premise";
import { ProgrammesSection } from "@/components/sections/programmes";
import { WhySection } from "@/components/sections/why";
import { buildFaq } from "@/content/faq";
import { getPrograms, getUpcomingEvents } from "@/lib/api";
import { hasStarted } from "@/lib/format";
import { organizationJsonLd, shareMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION } from "@/lib/site";

/**
 * Regenerated at most once a minute. This is what keeps the site inside the
 * API's read limit, and it is also why a change saved in the CRM shows here
 * within about a minute without a deploy.
 */
export const revalidate = 60;

const title = "Practical AI Training in Nigeria — Antitect";

export const metadata: Metadata = {
  title: { absolute: title },
  ...shareMetadata({ title, description: SITE_DESCRIPTION, path: "/" }),
};

const EVENTS_ON_HOME = 3;

export default async function HomePage() {
  const [upcoming, programs] = await Promise.all([getUpcomingEvents(EVENTS_ON_HOME + 1), getPrograms()]);

  // The cached list can be up to a minute old; an event that has just started is no longer upcoming.
  const events = upcoming.filter((event) => !hasStarted(event.startsAt));
  const nextProgram = programs[0] ?? null;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero event={events[0] ?? null} program={nextProgram} />
      <PremiseSection />
      <MethodSection />
      {events.length > 0 ? (
        <EventsSection events={events.slice(0, EVENTS_ON_HOME)} hasMore={events.length > EVENTS_ON_HOME} />
      ) : null}
      {programs.length > 0 ? <ProgrammesSection programs={programs} /> : null}
      <WhySection />
      <FaqSection items={buildFaq(nextProgram)} />
      <CommunitySection />
    </>
  );
}
