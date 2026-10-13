import type { Metadata } from "next";

import { EnquiriesCard } from "@/components/handover/cards";
import { HandoverSequences } from "@/components/handover/sequence";
import { CloseSection } from "@/components/home/close";
import { ContactSection } from "@/components/home/contact";
import { FormatsSection } from "@/components/home/formats";
import { OrbitHero } from "@/components/home/hero";
import { ProofSection } from "@/components/home/proof";
import { TasksSection } from "@/components/home/tasks";
import { JsonLd } from "@/components/json-ld";
import { FaqSection } from "@/components/sections/faq";
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

/**
 * The home page (Home B, the orbit hero): what Antitect teaches, the work it
 * hands over to AI, the three ways to learn it, the proof, the questions,
 * the people to talk to, and the community. Two API reads: upcoming events,
 * which feed the live line, the webinars and the workshops, and the
 * programmes.
 */
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
      <ProofSection />
      <FaqSection items={generalFaq} openFirst />
      <ContactSection />
      <CloseSection />
      <HandoverSequences />
    </>
  );
}
