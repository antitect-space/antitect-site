import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { formatDay, formatKobo } from "@/lib/format";
import { durationLabel, enrolmentState } from "@/lib/programs";

/**
 * A programme, showing only what its own record holds.
 *
 * Nothing here is written for "programmes in general": a card that claimed
 * three sessions a week would have been wrong for the one-week cohort sitting
 * beside it. Every line below is a field, or it is absent.
 */
export function ProgrammeCard({
  program,
  headingLevel: Heading = "h3",
}: {
  program: PublicProgram;
  headingLevel?: "h2" | "h3";
}) {
  const state = enrolmentState(program);
  const places = state === "open" ? placesNote(program) : null;

  const facts = [
    durationLabel(program),
    "Online",
    formatKobo(program.priceKobo),
    program.startsAt ? `Starts ${formatDay(program.startsAt)}` : null,
  ].filter(Boolean) as string[];

  return (
    <article className="cut-tr grid border-2 border-foreground bg-background lg:grid-cols-[1.5fr_1fr]">
      <div className="p-6 sm:p-8">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">
          Capability Development Programme
        </p>
        <Heading className="text-title mt-3 text-3xl sm:text-4xl">
          <Link href={`/programmes/${program.slug}`} className="hover:underline hover:underline-offset-4">
            {program.title}
          </Link>
        </Heading>
        {program.summary ? (
          <p className="mt-4 max-w-[52ch] text-lg leading-[1.5]">{program.summary}</p>
        ) : null}

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
          {facts.map((fact) => (
            <div key={fact} className="flex items-center gap-2">
              <dt className="sr-only">Detail</dt>
              <dd className="font-semibold">{fact}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col justify-between gap-6 border-t-2 border-foreground p-6 sm:p-8 lg:border-t-0 lg:border-l-2">
        {program.imageUrl ? (
          <div className="cut-bl relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image
              src={program.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div>
          {state === "full" ? <p className="font-semibold">This cohort is full.</p> : null}
          {places ? <p className="font-semibold">{places}</p> : null}
          <Button asChild size="lg" className="mt-4 w-full" variant={state === "open" ? "default" : "secondary"}>
            <Link href={`/programmes/${program.slug}`} aria-label={`${state === "open" ? "Enrol" : "See"}: ${program.title}`}>
              {state === "open" ? "Enrol" : "See the programme"}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
