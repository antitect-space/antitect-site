import type { Metadata } from "next";

import { EnquiriesCard } from "@/components/handover/cards";
import { HandoverSequences } from "@/components/handover/sequence";
import { FormatsSection } from "@/components/home/formats";
import { OrbitHero } from "@/components/home/hero";
import { TasksSection } from "@/components/home/tasks";
import { JsonLd } from "@/components/json-ld";
import { CommunitySection } from "@/components/sections/community";
import { FaqSection } from "@/components/sections/faq";
import { GallerySection } from "@/components/sections/gallery";
import { LoopSection } from "@/components/sections/loop";
import { PremiseSection } from "@/components/sections/premise";
import { WhySection } from "@/components/sections/why";
import { generalFaq } from "@/content/faq";
import { getPrograms, getUpcomingEvents } from "@/lib/api";
import { ofType, upcoming } from "@/lib/events";
import { organizationJsonLd, shareMetadata } from "@/lib/metadata";
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

export default async function HomePage() {
  const [events, programs] = await Promise.all([getUpcomingEvents(), getPrograms()]);

  // One guard for the whole page: nothing that has finished is ever upcoming.
  const live = upcoming(events);
  const webinars = ofType(live, "webinar");
  const workshops = ofType(live, "workshop");

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <OrbitHero webinar={webinars[0] ?? null} card={<EnquiriesCard />} />
      <TasksSection programs={programs} />
      <FormatsSection webinars={webinars} workshops={workshops} programme={programs[0] ?? null} />
      <HandoverSequences />
      <PremiseSection />
      <GallerySection />
      <LoopSection />
      <WhySection />
      {/* The section below is notched, and climbs into this one. */}
      <FaqSection items={generalFaq} className="notch-clearance" />
      <CommunitySection />
    </>
  );
}
