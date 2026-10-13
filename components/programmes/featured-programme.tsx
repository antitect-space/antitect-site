import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { formatDay, formatKobo } from "@/lib/format";
import { durationLabel, isPriced, isUnderWay, programmeOffer, runName } from "@/lib/programs";
import { cn } from "@/lib/utils";

/**
 * One open programme at the full content width (design C2), never a grid
 * with one card: where the run stands, the title and summary on the left;
 * its facts and the one red button on the right. Stacked on a phone.
 *
 * Enrolling, it leads to the programme ("See the programme", with places
 * left under it when few remain). Taking waitlist sign-ups, it leads to the
 * waitlist. Facts the CRM has not set read "to be announced", and the rest
 * are left out.
 */
export function FeaturedProgramme({
  program,
  flyer,
  as: Heading = "h2",
  className,
}: {
  program: PublicProgram;
  /** The programme's flyer, when it has one: a `<Flyer placement="card">`. */
  flyer?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  const offer = programmeOffer(program);
  const run = runName(program);
  const href = `/programmes/${program.slug}`;

  const status = offer.enrol
    ? run
      ? `${run} · Enrolling`
      : "Enrolling"
    : offer.waitlist === "join"
      ? "Waitlist open"
      : offer.waitlist === "next"
        ? `${isUnderWay(program) ? `${run ?? "This cohort"} under way` : (offer.closed ?? "Enrolment closed").replace(/\.$/, "")} · Waitlist open for the next cohort`
        : (offer.closed ?? "Enrolment closed").replace(/\.$/, "");

  const action = offer.enrol
    ? { label: "See the programme", href }
    : offer.waitlist
      ? { label: "Join the waitlist", href: `${href}#waitlist` }
      : (offer.nextRun ?? { label: "See the programme", href });
  const places = offer.enrol ? placesNote(program) : null;

  // A waitlist is for the next cohort, whose price and dates this run's record does not give.
  const price = offer.enrol && isPriced(program) ? formatKobo(program.priceKobo) : null;
  const starts = offer.enrol && program.startsAt ? `Starts ${formatDay(program.startsAt)}` : null;
  const facts = [
    durationLabel(program),
    "Live online",
    price,
    starts,
    !price && !starts ? "Dates and price to be announced" : !starts ? "Dates to be announced" : !price ? "Price to be announced" : null,
  ].filter((fact): fact is string => Boolean(fact));

  const text = (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="type-meta flex items-center gap-2 font-semibold text-ink">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink" />
        {status}
      </p>
      <Heading className="type-h2 text-ink">
        <Link href={href} className="underline-offset-4 hover:underline">
          {program.title}
        </Link>
      </Heading>
      {program.summary ? <p className="type-lead text-ink">{program.summary}</p> : null}
    </div>
  );

  const factList = (
    <ul className="border-t border-rule">
      {facts.map((fact) => (
        <li key={fact} className="type-body border-b border-rule py-2.5 font-medium text-ink tabular-nums">
          {fact}
        </li>
      ))}
    </ul>
  );

  const button = (
    <div className="flex flex-col gap-3">
      <Button asChild size="lg" className="w-full px-5">
        <Link href={action.href} aria-label={`${action.label}: ${program.title}`}>
          {action.label}
        </Link>
      </Button>
      {places ? <p className="type-meta font-medium text-ink-muted tabular-nums">{places}</p> : null}
    </div>
  );

  const box = "grid gap-6 rounded-md border border-field-border bg-paper p-6 lg:p-10";

  if (flyer) {
    return (
      <article className={cn(box, "lg:grid-cols-[368fr_680fr]", className)}>
        <div className="min-w-0">{flyer}</div>
        <div className="flex min-w-0 flex-col gap-6">
          {text}
          <div className="grid gap-6 lg:grid-cols-[376fr_280fr]">
            {factList}
            <div className="lg:pt-[11px]">{button}</div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn(box, "lg:grid-cols-[720fr_328fr]", className)}>
      {text}
      <div className="flex flex-col gap-6">
        {factList}
        {button}
      </div>
    </article>
  );
}
