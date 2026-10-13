import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/detail/back-link";
import { Description } from "@/components/detail/description";
import { DetailLayout } from "@/components/detail/detail-layout";
import { FactsStrip } from "@/components/detail/facts-strip";
import { RegisterBar } from "@/components/detail/register-bar";
import { Flyer } from "@/components/flyer/flyer";
import { CloseSection } from "@/components/home/close";
import { JsonLd } from "@/components/json-ld";
import { ProgrammePanel } from "@/components/programme-panel";
import { LoopCompact } from "@/components/programmes/loop";
import { OutcomeList, Timetable } from "@/components/programmes/outcomes";
import { ProjectList } from "@/components/programmes/project-list";
import { RecordingPlayer } from "@/components/recording/recording-player";
import { FaqList } from "@/components/sections/faq";
import { programmeFaq } from "@/content/faq";
import { programmePage } from "@/content/programmes";
import { getPastEvents, getProgram, type PublicProgram } from "@/lib/api";
import { webinarsOf } from "@/lib/events";
import { flyerOf } from "@/lib/flyers";
import { formatDay, formatDayMonth, formatKobo } from "@/lib/format";
import { courseJsonLd, shareMetadata } from "@/lib/metadata";
import {
  commitmentSentence,
  durationLabel,
  isDraft,
  isPriced,
  isUnderWay,
  programmeOffer,
  projectRows,
  runName,
  weeklySchedule,
  type ProgrammeOffer,
} from "@/lib/programs";
import { pastRecordings } from "@/lib/recordings";

/** Read again at most once a minute; what the panel offers is checked again on submit. */
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/programmes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: "Programme not available", robots: { index: false } };

  return {
    title: program.title,
    // The summary only. A price or a date in a preview outlives the cohort it was true for.
    // The share image is drawn by opengraph-image.tsx beside this page.
    ...shareMetadata({
      title: program.title,
      description: program.summary,
      path: `/programmes/${program.slug}`,
      generatedImage: true,
    }),
  };
}

/**
 * A programme's page (design "Programme · Enrolling", "Waitlist only",
 * "Enrolment closed" and "With flyer", with the enrolment panel's states in
 * C6). Everything cohort-specific comes from the record: what it costs, how
 * long it runs, what it asks of a week, when it starts. A fact without a
 * figure is left out, and so is a sentence that needs one.
 */
export default async function ProgrammePage({ params }: PageProps<"/programmes/[slug]">) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const [past, flyer] = await Promise.all([getPastEvents(), flyerOf(program.imageUrl)]);
  const offer = programmeOffer(program);
  const commitment = commitmentSentence(program);
  const schedule = weeklySchedule(program);
  const projects = projectRows(program);
  const leaveWith = [...(program.certificateEnabled ? [programmePage.certificate] : []), ...program.outcomes];
  const sample = pastRecordings(webinarsOf(past))[0] ?? null;
  const faq = programmeFaq(program);

  // One community ask per page: with nothing else to offer, the panel holds the form.
  const panelHoldsCommunity = !offer.enrol && !offer.waitlist && !offer.nextRun;

  return (
    <>
      <JsonLd data={courseJsonLd(program)} />
      <DetailLayout
        head={
          <div className="flex flex-col gap-8 lg:gap-10">
            <div className="flex flex-col gap-4 lg:gap-6">
              <BackLink href={programmePage.back.href} label={programmePage.back.label} />
              <div className="flex flex-col gap-3 lg:gap-4">
                <p className="type-meta font-medium text-ink-muted">{metaLine(program, offer)}</p>
                <h1 className="type-h1 text-ink">{program.title}</h1>
                {program.summary ? <p className="type-lead text-ink-muted">{program.summary}</p> : null}
              </div>
            </div>
            <FactsStrip facts={facts(program, offer)} />
          </div>
        }
        panel={<ProgrammePanel program={program} offer={offer} />}
      >
        {flyer ? <Flyer image={flyer} title={program.title} placement="detail" /> : null}

        <section aria-labelledby="asks-title" className="flex flex-col gap-5 lg:gap-6">
          <h2 id="asks-title" className="type-h2 text-ink">
            {programmePage.asks}
          </h2>
          {commitment ? <p className="type-body max-w-[564px] text-ink">{commitment}</p> : null}
          {schedule.length > 0 ? <Timetable rows={schedule} /> : null}
          <LoopCompact />
        </section>

        {projects.length > 0 || program.description ? (
          <section aria-labelledby="build-title" className="flex flex-col gap-6">
            <h2 id="build-title" className="type-h2 text-ink">
              {programmePage.build}
            </h2>
            {projects.length > 0 ? <ProjectList projects={projects} /> : null}
            {program.description ? <Description text={program.description} /> : null}
          </section>
        ) : null}

        {leaveWith.length > 0 ? (
          <section aria-labelledby="leave-title" className="flex flex-col gap-6">
            <h2 id="leave-title" className="type-h2 text-ink">
              {programmePage.leaveWith}
            </h2>
            <OutcomeList items={leaveWith} />
          </section>
        ) : null}

        {sample ? (
          <section aria-labelledby="teach-title" className="flex flex-col gap-5 lg:gap-6">
            <h2 id="teach-title" className="type-h2 text-ink">
              {programmePage.teach}
            </h2>
            <figure className="flex flex-col gap-3">
              <RecordingPlayer recording={sample.recording} title={sample.event.title} sizes="(min-width: 1024px) 662px, 100vw" />
              <figcaption className="type-meta font-medium text-ink-muted tabular-nums">
                From {sample.event.title}, {formatDay(sample.event.startsAt)}
              </figcaption>
            </figure>
          </section>
        ) : null}

        {faq.length > 0 ? (
          <section aria-labelledby="questions-title" className="flex flex-col gap-6 lg:gap-8">
            <h2 id="questions-title" className="type-h2 text-ink">
              Questions about {program.title}
            </h2>
            <FaqList items={faq} openFirst narrow />
          </section>
        ) : null}
      </DetailLayout>

      {panelHoldsCommunity ? null : <CloseSection quiet />}

      {/* Only while a place can be bought. */}
      {offer.enrol ? <RegisterBar label="Secure your place" lines={barLines(program)} /> : null}
    </>
  );
}

/** "Capability development programme · Cohort 1 · Live online", or the run's state in place of the format. */
function metaLine(program: PublicProgram, offer: ProgrammeOffer): string {
  const draft = isDraft(program);
  const which = draft ? "Waitlist open" : runName(program);
  const state =
    offer.enrol || draft
      ? "Live online"
      : program.isFull
        ? "Full"
        : isUnderWay(program)
          ? "Under way"
          : "Enrolment closed";
  return [programmePage.kind, which, state].filter(Boolean).join(" · ");
}

/** The facts strip: each fact only with its figure. A draft has none of the run's yet. */
function facts(program: PublicProgram, offer: ProgrammeOffer) {
  const draft = isDraft(program);
  const closes = program.enrollmentClosesAt ?? program.startsAt;
  const closed = closes ? new Date(closes).getTime() <= Date.now() : false;
  return [
    { label: "Length", value: durationLabel(program) },
    { label: "Format", value: "Live online" },
    { label: "Price", value: !draft && isPriced(program) ? formatKobo(program.priceKobo) : null },
    {
      label: isUnderWay(program) ? "Started" : "Starts",
      value: !draft && program.startsAt ? formatDay(program.startsAt) : null,
    },
    // A closing date matters while enrolling, and as a record once it has passed.
    offer.enrol
      ? { label: "Enrolment closes", value: closes ? formatDay(closes) : null }
      : { label: "Enrolment closed", value: !draft && closed && closes ? formatDay(closes) : null },
  ];
}

/** The start and the price, on two lines, so the bar holds at 360px. */
function barLines(program: PublicProgram): string[] {
  return [
    program.startsAt ? `Starts ${formatDayMonth(program.startsAt)}` : null,
    isPriced(program) ? formatKobo(program.priceKobo) : null,
  ].filter((line): line is string => Boolean(line));
}
