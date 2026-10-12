import Link from "next/link";

import { Depth } from "@/components/home/depth";
import { SectionHead } from "@/components/home/section-head";
import { ArrowRight } from "@/components/icons";
import { Fresh } from "@/components/live";
import { Button } from "@/components/ui/button";
import { formats, formatsSection, nothingNext, type Format } from "@/content/formats";
import type { PublicEvent, PublicProgram } from "@/lib/api";
import { isPaid, placesNote } from "@/lib/events";
import { formatDayMonth, formatDayShort, formatKobo } from "@/lib/format";
import { durationLabel, isPriced, programmeOffer, runName } from "@/lib/programs";

/**
 * "Three ways to learn" (Home B, section 3, design section 07): one card per
 * format, deepest last. Each has a fixed part, then a live part headed "Next"
 * from the CRM, then a link. Buttons in the cards are outlined ink, never red.
 *
 * On a desktop the three cards share their rows (subgrid), so the "Next"
 * rules line up whatever each card holds.
 */
export function FormatsSection({
  webinars,
  workshops,
  programme,
}: {
  webinars: readonly PublicEvent[];
  workshops: readonly PublicEvent[];
  programme: PublicProgram | null;
}) {
  return (
    <section id={formatsSection.id} aria-labelledby="formats-title" className="scroll-mt-10 pb-16 lg:pb-28">
      <div className="container-site">
        <SectionHead id="formats-title" title={formatsSection.title} intro={formatsSection.intro} />

        <div className="mt-10 grid gap-4 lg:mt-16 lg:grid-cols-3 lg:grid-rows-[auto_1fr_auto] lg:gap-x-6 lg:gap-y-0">
          <FormatCard format={formats.webinars}>
            <WebinarsNext webinars={webinars.slice(0, 2)} />
          </FormatCard>
          <FormatCard format={formats.workshops}>
            <WorkshopNext workshop={workshops[0] ?? null} />
          </FormatCard>
          <FormatCard format={formats.programmes}>
            <ProgrammeNext programme={programme} />
          </FormatCard>
        </div>
      </div>
    </section>
  );
}

function FormatCard({ format, children }: { format: Format; children: React.ReactNode }) {
  return (
    <article className="grid gap-6 rounded-md border border-field-border bg-paper p-6 lg:row-span-3 lg:grid-rows-subgrid">
      <div className="flex flex-col gap-4">
        <Depth level={format.depth} time={format.time} />
        <div className="flex flex-col gap-1.5">
          <h3 className="type-h3 text-ink">{format.title}</h3>
          <p className="text-[1.3125rem] leading-[1.35] text-ink">{format.promise}</p>
        </div>
        <p className="type-small font-medium text-ink">{format.facts}</p>
        <p className="type-body text-ink-muted">{format.description}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-rule pt-6">
        <h4 className="type-meta font-medium text-ink-muted">Next</h4>
        {children}
      </div>

      <Button asChild variant="text" className="justify-self-start">
        <Link href={format.link.href}>
          {format.link.label}
          <ArrowRight />
        </Link>
      </Button>
    </article>
  );
}

/** The next one or two webinars, each a row with its date and topic. */
function WebinarsNext({ webinars }: { webinars: readonly PublicEvent[] }) {
  if (webinars.length === 0) return <Nothing message={nothingNext.events} />;

  return (
    <ul className="flex flex-col">
      {webinars.map((webinar) => (
        // A row disappears once its webinar has started, even from a cached page.
        <Fresh key={webinar.slug} startsAt={webinar.startsAt} endsAt={webinar.endsAt}>
          <li className="flex items-center justify-between gap-3 border-b border-rule py-2">
            <div className="type-small flex min-w-0 flex-col gap-0.5 text-ink">
              <time dateTime={webinar.startsAt} className="font-semibold tabular-nums">
                {formatDayShort(webinar.startsAt)}
              </time>
              <span>{webinar.title}</span>
            </div>
            <Button asChild variant="text">
              <Link href={`/events/${webinar.slug}`}>
                {isPaid(webinar) ? "Get a seat" : "Register"}
                <ArrowRight />
              </Link>
            </Button>
          </li>
        </Fresh>
      ))}
    </ul>
  );
}

/** The next workshop: when, where, what it costs, and a seat. */
function WorkshopNext({ workshop }: { workshop: PublicEvent | null }) {
  if (!workshop) return <Nothing message={nothingNext.events} />;

  const where = workshop.format === "in_person" ? workshop.venue?.name : "Online";
  const price = isPaid(workshop) ? formatKobo(workshop.priceKobo) : "Free";
  const places = placesNote(workshop);

  return (
    <Fresh startsAt={workshop.startsAt} endsAt={workshop.endsAt} fallback={<Nothing message={nothingNext.events} />}>
      <div className="flex flex-col gap-3">
        <div className="type-small flex flex-col gap-1.5 font-medium text-ink tabular-nums">
          <Facts items={[formatDayShort(workshop.startsAt), where].filter((fact): fact is string => Boolean(fact))} />
          <Facts items={[price, places].filter((fact): fact is string => Boolean(fact))} />
        </div>
        {workshop.isFull ? (
          <>
            <p className="type-body text-ink">Every place has been taken.</p>
            <Action href={nothingNext.action.href}>Notify me about the next one</Action>
          </>
        ) : (
          <Action href={`/events/${workshop.slug}`}>
            {isPaid(workshop) ? `Get a seat · ${price}` : "Register"}
          </Action>
        )}
      </div>
    </Fresh>
  );
}

/**
 * The programme run the CRM offers first, and where it stands. What it
 * offers is decided once, in `programmeOffer`, so this card, the programme's
 * own page and its checkout cannot disagree.
 */
function ProgrammeNext({ programme }: { programme: PublicProgram | null }) {
  if (!programme) return <Nothing message={nothingNext.programmes} />;

  const offer = programmeOffer(programme);
  const run = runName(programme);
  const href = `/programmes/${programme.slug}`;
  const full = programme.isFull;
  const price = isPriced(programme) ? formatKobo(programme.priceKobo) : null;
  const capacity = programme.capacity && !offer.enrol ? `${programme.capacity} places` : null;
  const facts = [durationLabel(programme), price, capacity, run].filter((fact): fact is string => Boolean(fact));

  let status: string;
  let note: string | null = null;
  let action: { label: string; href: string };

  if (offer.enrol) {
    status = programme.startsAt ? `Enrolling · Starts ${formatDayMonth(programme.startsAt)}` : "Enrolling";
    action = { label: price ? `Secure your place · ${price}` : "Secure your place", href };
  } else if (offer.waitlist === "join") {
    status = "Waitlist open";
    action = { label: "Join the waitlist", href: `${href}#waitlist` };
  } else {
    status = full ? "Full" : "Enrolment closed";
    note = full ? `Every place in ${run ?? "this cohort"} has been taken.` : offer.closed;
    action =
      offer.waitlist === "next"
        ? { label: "Notify me about the next cohort", href: `${href}#waitlist` }
        : (offer.nextRun ?? { label: "Notify me about the next cohort", href: nothingNext.action.href });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="type-small flex flex-col gap-0.5 text-ink tabular-nums">
        <p className="font-semibold">{programme.title}</p>
        {facts.length > 0 ? <Facts items={facts} /> : null}
      </div>
      <p className="type-meta flex items-center gap-2 font-semibold text-ink">
        <span aria-hidden="true" className="size-2 shrink-0 bg-ink" />
        {status}
      </p>
      {note ? <p className="type-body text-ink">{note}</p> : null}
      <Action href={action.href}>{action.label}</Action>
    </div>
  );
}

/** "6 weeks · ₦100,000 · Cohort 1", wrapping between facts and never inside one. */
function Facts({ items }: { items: readonly string[] }) {
  return (
    <p>
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 ? " · " : null}
          <span className="whitespace-nowrap">{item}</span>
        </span>
      ))}
    </p>
  );
}

function Nothing({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-body text-ink">{message}</p>
      <Action href={nothingNext.action.href}>{nothingNext.action.label}</Action>
    </div>
  );
}

function Action({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" className="self-start px-4 tabular-nums">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
