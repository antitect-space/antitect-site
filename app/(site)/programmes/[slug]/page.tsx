import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Cut, CutFrame } from "@/components/cut";
import { JsonLd } from "@/components/json-ld";
import { ProjectsTable, WeeklySchedule } from "@/components/programme-details";
import { ProgrammePanel } from "@/components/programme-panel";
import { FaqSection } from "@/components/sections/faq";
import { programmeFaq } from "@/content/faq";
import { getProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { formatDay, formatKobo } from "@/lib/format";
import { courseJsonLd, shareMetadata } from "@/lib/metadata";
import {
  commitmentSentence,
  durationLabel,
  enrolmentClosesNote,
  isPriced,
  isUnderWay,
  programmeOffer,
  projectRows,
  runName,
  weeklySchedule,
} from "@/lib/programs";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/programmes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: "Programme not found", robots: { index: false } };

  return {
    title: program.title,
    // The summary only. A price or a date in a preview outlives the cohort it was true for.
    ...shareMetadata({
      title: program.title,
      description: program.summary,
      path: `/programmes/${program.slug}`,
      imageUrl: program.imageUrl,
    }),
  };
}

/**
 * Everything cohort-specific lives here, and all of it comes from the record:
 * what it costs, how long it runs, what it asks of a week, when it starts.
 * The home page deliberately answers none of that, because it lists several.
 */
export default async function ProgrammePage({ params }: PageProps<"/programmes/[slug]">) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const offer = programmeOffer(program);
  const run = runName(program);
  const commitment = commitmentSentence(program);
  // A closing date and places left only mean something while a place can be bought.
  const closes = offer.enrol ? enrolmentClosesNote(program) : null;
  const places = offer.enrol ? placesNote(program) : null;
  const schedule = weeklySchedule(program);
  const projects = projectRows(program);
  // What the run leaves you with: its outcomes, and the certificate when it
  // issues one. The certificate is said here because that is what it is.
  const leaveWith = [
    ...(program.certificateEnabled ? ["A digital certificate when you complete the programme."] : []),
    ...program.outcomes,
  ];

  const facts = [
    { label: "Length", value: durationLabel(program) },
    { label: "Format", value: "Live, online" },
    // A run up before it is ready to sell may have neither yet. Never "Free":
    // a programme is never free.
    { label: "Price", value: isPriced(program) ? formatKobo(program.priceKobo) : "To be confirmed" },
    {
      label: isUnderWay(program) ? "Started" : "Next cohort",
      value: program.startsAt ? formatDay(program.startsAt) : "To be confirmed",
    },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));
  // Three facts when the length is not set yet, which a draft often is not.
  const factColumns = facts.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";

  return (
    <>
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:py-16">
        <JsonLd data={courseJsonLd(program)} />

        <header className="lg:col-start-1">
          <p className="text-[0.9375rem] font-semibold text-muted-foreground">
            Capability Development Programme{run ? ` · ${run}` : ""}
          </p>
          <h1 className="text-display mt-3 text-[2.5rem] sm:text-6xl">{program.title}</h1>
          {program.summary ? (
            <p className="mt-6 max-w-[52ch] text-xl leading-[1.5]">{program.summary}</p>
          ) : null}

          {/* On a phone an odd last fact takes the whole row, rather than leaving a black gap beside it. */}
          <dl
            className={`mt-8 grid grid-cols-2 gap-px border-2 border-foreground bg-foreground [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1 ${factColumns}`}
          >
            {facts.map((fact) => (
              <div key={fact.label} className="bg-background p-4">
                <dt className="text-[0.8125rem] font-semibold text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
          {closes ? <p className="mt-4 font-semibold">{closes}</p> : null}
          {places ? <p className="mt-1 font-semibold">{places}</p> : null}
        </header>

        {/* On a phone this lands directly under the heading block: a place, or the waitlist, is the point of the page. */}
        <div
          id="enrol"
          className="scroll-mt-4 self-start lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <CutFrame corner="bl" innerClassName="p-6 sm:p-8">
            <ProgrammePanel program={program} offer={offer} />
          </CutFrame>
        </div>

        <div className="space-y-10 lg:col-start-1">
          {program.imageUrl ? (
            <Cut corner="tr" className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={program.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 36rem, 100vw"
                className="object-cover"
              />
            </Cut>
          ) : null}

          {program.description ? (
            <p className="max-w-[62ch] text-lg leading-[1.6] whitespace-pre-line">{program.description}</p>
          ) : null}

          {commitment ? (
            <section aria-labelledby="commitment-title" className="border-t-2 border-foreground pt-6">
              <h2 id="commitment-title" className="text-title text-2xl">
                What it asks of you
              </h2>
              <p className="mt-3 max-w-[56ch] text-lg leading-[1.5]">{commitment}</p>
            </section>
          ) : null}

          {schedule.length > 0 ? (
            <section aria-labelledby="schedule-title" className="border-t-2 border-foreground pt-6">
              <h2 id="schedule-title" className="text-title text-2xl">
                Every week
              </h2>
              <div className="mt-5">
                <WeeklySchedule rows={schedule} />
              </div>
            </section>
          ) : null}

          {projects.length > 0 ? (
            <section aria-labelledby="projects-title" className="border-t-2 border-foreground pt-6">
              <h2 id="projects-title" className="text-title text-2xl">
                What you will build
              </h2>
              <div className="mt-6">
                <ProjectsTable rows={projects} />
              </div>
            </section>
          ) : null}

          {leaveWith.length > 0 ? (
            <section aria-labelledby="outcomes-title" className="border-t-2 border-foreground pt-6">
              <h2 id="outcomes-title" className="text-title text-2xl">
                What you leave with
              </h2>
              <ul className="mt-4 space-y-3">
                {leaveWith.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-lg leading-[1.5]">
                    <span aria-hidden="true" className="mt-[0.55em] size-2 shrink-0 bg-brand" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <FaqSection items={programmeFaq(program)} title={`${program.title}: the details`} id="programme-faq" />
    </>
  );
}
