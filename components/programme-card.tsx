import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { commitmentSentence, durationLabel, enrolmentState, priceAndCohort } from "@/lib/programs";

/**
 * A programme as a hard-edged block: what it is, what it demands, what you
 * leave with, and what it costs. Every figure comes from the record; the
 * sentences around them are fixed.
 */
export function ProgrammeCard({ program, headingLevel = "h3" }: { program: PublicProgram; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const commitment = commitmentSentence(program);
  const state = enrolmentState(program);
  const note = state === "open" ? placesNote(program) : null;

  return (
    <article className="grid border border-foreground bg-background lg:grid-cols-[1.4fr_1fr]">
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-[0.9375rem] font-medium text-muted-foreground">
          {[durationLabel(program), "Instructor-led", "Online"].filter(Boolean).join(" · ")}
        </p>
        <Heading className="text-title mt-3 text-3xl sm:text-4xl">
          <Link href={`/programmes/${program.slug}`} className="hover:underline hover:underline-offset-4">
            {program.title}
          </Link>
        </Heading>
        <p className="mt-5 max-w-[62ch] text-lg leading-[1.6]">{program.summary}</p>
        <p className="mt-4 max-w-[62ch] leading-[1.6] text-muted-foreground">
          {commitment ? `${commitment} ` : ""}You progress by finishing projects, not by attending.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-8 border-t border-foreground p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
        {program.outcomes.length > 0 ? (
          <div>
            <p className="font-semibold">What you leave with</p>
            <ul className="mt-3 space-y-2">
              {program.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 leading-[1.5]">
                  <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 bg-foreground" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="text-title text-2xl">{priceAndCohort(program)}</p>
          {note ? <p className="mt-2 font-medium">{note}</p> : null}
          {state === "full" ? <p className="mt-2 font-medium">This cohort is full.</p> : null}
          <Button asChild variant="secondary" size="lg" className="mt-5 w-full sm:w-auto">
            <Link href={`/programmes/${program.slug}`} aria-label={`Enrol: ${program.title}`}>
              {state === "open" ? "Enrol" : "See the programme"}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
