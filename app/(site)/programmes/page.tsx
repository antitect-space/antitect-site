import type { Metadata } from "next";

import { ListingHeader, NothingScheduled } from "@/components/detail/listing";
import { NextStep } from "@/components/detail/next-step";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { FeaturedProgramme } from "@/components/programmes/featured-programme";
import { Loop } from "@/components/programmes/loop";
import { RecordingPlayer } from "@/components/recording/recording-player";
import { FaqSection } from "@/components/sections/faq";
import { programmesFaq, programmesPage } from "@/content/programmes";
import { getPastEvents, getPrograms, type PublicProgram } from "@/lib/api";
import { webinarsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { formatDay } from "@/lib/format";
import { shareMetadata } from "@/lib/metadata";
import { capitalise, programmeOffer, reviewPhrase } from "@/lib/programs";
import { pastRecordings } from "@/lib/recordings";

/** Read again at most once a minute, like every page built from the CRM. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: programmesPage.title,
  ...shareMetadata({ title: programmesPage.title, description: programmesPage.description, path: "/programmes" }),
};

/**
 * The programmes page (design "Programmes · Enrolling", "Waitlist open",
 * "Nothing open" and "With flyer"): one block per open programme, enrolling
 * first and then those taking waitlist sign-ups, never a grid with one card;
 * then how every programme works, a session to watch, the shorter formats,
 * questions, and the community.
 *
 * With nothing open, the community form takes the programmes' place and the
 * community band goes: one ask for the community per page.
 */
export default async function ProgrammesPage() {
  const [programs, past] = await Promise.all([getPrograms(), getPastEvents()]);
  const open = openProgrammes(programs);
  const flyers = await Promise.all(open.map((program) => flyerOf(program.imageUrl)));
  const sample = pastRecordings(webinarsOf(past))[0] ?? null;
  const review = open[0] ? reviewPhrase(open[0]) : null;

  return (
    <>
      <ListingHeader title={programmesPage.title} lead={programmesPage.lead} facts={programmesPage.facts} />

      {open.length > 0 ? (
        <section aria-label="Open programmes" className="container-site flex flex-col gap-6 pb-16 lg:pb-28">
          {open.map((program, index) => {
            const flyer = flyers[index];
            return (
              <FeaturedProgramme
                key={program.slug}
                program={program}
                primary={index === 0}
                flyer={flyer ? <Flyer image={flyer} title={program.title} placement="card" /> : null}
              />
            );
          })}
        </section>
      ) : (
        <NothingScheduled title={programmesPage.nothing.title} line={programmesPage.nothing.line} />
      )}

      <hr className="border-rule" />
      <section aria-labelledby="loop-title" className="section-pad">
        <div className="container-site flex flex-col gap-10 lg:gap-14">
          <h2 id="loop-title" className="type-h2 text-ink">
            {programmesPage.howItWorks}
          </h2>
          <Loop review={review ? capitalise(review) : null} />
        </div>
      </section>

      <hr className="border-rule" />
      {sample ? (
        <section aria-labelledby="teach-title" className="pt-16 pb-12 lg:pt-28 lg:pb-16">
          <div className="container-site flex flex-col gap-5 lg:gap-6">
            <h2 id="teach-title" className="type-h2 text-ink">
              {programmesPage.teach}
            </h2>
            <figure className="flex max-w-[760px] flex-col gap-3">
              <RecordingPlayer recording={sample.recording} title={sample.event.title} sizes="(min-width: 1024px) 760px, 100vw" />
              <figcaption className="type-meta font-medium text-ink-muted tabular-nums">
                From {sample.event.title}, {formatDay(sample.event.startsAt)}
              </figcaption>
            </figure>
          </div>
        </section>
      ) : null}
      <div className={`container-site pb-16 lg:pb-28 ${sample ? "" : "pt-16 lg:pt-28"}`}>
        <div className="max-w-[662px]">
          <NextStep
            label={programmesPage.startSooner.label}
            text={programmesPage.startSooner.text}
            links={programmesPage.startSooner.links}
          />
        </div>
      </div>

      <hr className="border-rule" />
      <FaqSection id="programmes-faq" title={programmesPage.faqTitle} items={programmesFaq} openFirst />

      {open.length > 0 ? <CloseSection quiet /> : null}
    </>
  );
}

/** The programmes with something to sign up for: enrolling first, then those taking waitlist sign-ups. */
function openProgrammes(programs: readonly PublicProgram[]): PublicProgram[] {
  const offers = programs.map((program) => ({ program, offer: programmeOffer(program) }));
  return [
    ...offers.filter(({ offer }) => offer.enrol),
    ...offers.filter(({ offer }) => !offer.enrol && offer.waitlist),
  ].map(({ program }) => program);
}
