import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentForm } from "@/components/forms/payment-form";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { getProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { courseJsonLd, shareMetadata } from "@/lib/metadata";
import { commitmentSentence, durationLabel, enrolmentClosesNote, enrolmentState, priceAndCohort } from "@/lib/programs";

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

export default async function ProgrammePage({ params }: PageProps<"/programmes/[slug]">) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const state = enrolmentState(program);
  const commitment = commitmentSentence(program);
  const closes = enrolmentClosesNote(program);
  const note = state === "open" ? placesNote(program) : null;

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:py-20">
      <JsonLd data={courseJsonLd(program)} />

      <header className="lg:col-start-1">
        <p className="text-[0.9375rem] font-medium text-muted-foreground">
          {["Capability Development Programme", durationLabel(program), "Online"].filter(Boolean).join(" · ")}
        </p>
        <h1 className="text-display mt-3 text-[2.5rem] sm:text-6xl">{program.title}</h1>
        <p className="mt-6 max-w-[60ch] text-xl leading-[1.5]">{program.summary}</p>
        <p className="text-title mt-6 text-2xl">{priceAndCohort(program)}</p>
        {closes ? <p className="mt-2 font-medium">{closes}</p> : null}
        {note ? <p className="mt-2 font-medium">{note}</p> : null}
      </header>

      <div id="enrol" className="scroll-mt-4 self-start lg:sticky lg:top-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div className="border border-foreground p-6 sm:p-8">
          {state === "open" ? (
            <PaymentForm
              payable={{ kind: "program", slug: program.slug }}
              title={program.title}
              priceKobo={program.priceKobo}
              closesAt={program.enrollmentClosesAt ?? program.startsAt}
            />
          ) : (
            <div>
              <h2 className="text-title text-2xl">
                {state === "full" ? "This cohort is full." : "Enrolment for this cohort has closed."}
              </h2>
              <p className="mt-3 leading-[1.6] text-muted-foreground">
                Join the community and you will hear first when the next cohort opens.
              </p>
              <Button asChild className="mt-6">
                <Link href="/community">Join the community</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-12 lg:col-start-1">
        {program.imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image src={program.imageUrl} alt="" fill sizes="(min-width: 1024px) 40rem, 100vw" className="object-cover" />
          </div>
        ) : null}

        {program.description ? (
          <p className="max-w-[65ch] text-lg leading-[1.6] whitespace-pre-line">{program.description}</p>
        ) : null}

        <section aria-labelledby="commitment-title" className="border-t-2 border-foreground pt-6">
          <h2 id="commitment-title" className="text-title text-2xl">
            What it asks of you
          </h2>
          <p className="mt-3 max-w-[60ch] text-lg leading-[1.6]">
            {commitment ? `${commitment} ` : ""}
            Live sessions run on weekday evenings and at the weekend, so you do not have to stop working. You
            progress by finishing projects, not by attending.
          </p>
        </section>

        {program.projects.length > 0 ? (
          <section aria-labelledby="projects-title" className="border-t-2 border-foreground pt-6">
            <h2 id="projects-title" className="text-title text-2xl">
              What you will build
            </h2>
            <ol className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
              {program.projects.map((project, index) => (
                <li key={project.title} className="bg-background p-5 sm:odd:last:col-span-2">
                  <span aria-hidden="true" className="text-sm font-semibold text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-title mt-3 text-xl">{project.title}</h3>
                  {project.description ? (
                    <p className="mt-2 leading-[1.6] whitespace-pre-line text-muted-foreground">{project.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {program.outcomes.length > 0 ? (
          <section aria-labelledby="outcomes-title" className="border-t-2 border-foreground pt-6">
            <h2 id="outcomes-title" className="text-title text-2xl">
              What you leave with
            </h2>
            <ul className="mt-4 space-y-3">
              {program.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-lg leading-[1.5]">
                  <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 bg-foreground" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="loop-title" className="border-t-2 border-foreground pt-6">
          <h2 id="loop-title" className="text-title text-2xl">
            How it runs
          </h2>
          <p className="mt-3 max-w-[60ch] text-lg leading-[1.6] text-muted-foreground">
            Every week follows the same loop: learn what the project needs, build it, have it reviewed one to
            one, improve it, and apply it to your own work.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/#how-it-works">How Antitect works</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
