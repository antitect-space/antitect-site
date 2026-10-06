import Image from "next/image";
import Link from "next/link";

import { Cut, CutFrame } from "@/components/cut";
import { Button } from "@/components/ui/button";
import type { PublicProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { formatDay } from "@/lib/format";
import {
  durationLabel,
  isUnderWay,
  priceLabel,
  programmeOffer,
  runName,
  type ProgrammeOffer,
} from "@/lib/programs";

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
  const offer = programmeOffer(program);
  const run = runName(program);
  const places = offer.enrol ? placesNote(program) : null;

  const facts = [
    durationLabel(program),
    "Online",
    priceLabel(program),
    program.startsAt
      ? `${isUnderWay(program) ? "Started" : "Starts"} ${formatDay(program.startsAt)}`
      : "Dates to be confirmed",
  ].filter(Boolean) as string[];

  return (
    <CutFrame corner="tr">
      <article className="grid lg:grid-cols-[1.5fr_1fr]">
      <div className="p-6 sm:p-8">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">
          Capability Development Programme{run ? ` · ${run}` : ""}
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
          <Cut corner="bl" className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image
              src={program.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover"
            />
          </Cut>
        ) : null}

        <div>
          {offer.closed ? <p className="font-semibold">{offer.closed}</p> : null}
          {places ? <p className="font-semibold">{places}</p> : null}
          <CardActions offer={offer} slug={program.slug} title={program.title} />
        </div>
      </div>
      </article>
    </CutFrame>
  );
}

/**
 * The same choices as the programme's own page, as links to it. Joining goes
 * to #waitlist, which opens the page on the waitlist form.
 */
function CardActions({ offer, slug, title }: { offer: ProgrammeOffer; slug: string; title: string }) {
  const href = `/programmes/${slug}`;
  const actions: Array<{ label: string; href: string; variant: "default" | "outline" | "secondary" }> = offer.enrol
    ? [{ label: "Secure your spot", href, variant: "default" }]
    : offer.waitlist
      ? [{ label: "Join waitlist", href: `${href}#waitlist`, variant: "default" }]
      : [{ label: "See the programme", href, variant: "secondary" }];

  return (
    <div className="mt-4 grid gap-3">
      {actions.map((action) => (
        <Button key={action.label} asChild size="lg" className="w-full" variant={action.variant}>
          <Link href={action.href} aria-label={`${action.label}: ${title}`}>
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
