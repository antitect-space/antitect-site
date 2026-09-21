import Link from "next/link";

import { CutFrame } from "@/components/cut";
import { RelativeLabel, Started } from "@/components/live";
import { Button } from "@/components/ui/button";
import type { PublicEvent, PublicProgram } from "@/lib/api";
import { eventAction, eventLabel, placesNote, registrationState } from "@/lib/events";
import { firstSentence, ticketDate } from "@/lib/format";
import { enrolmentState, priceAndCohort } from "@/lib/programs";

/**
 * A ticket, because everybody already knows what one is: a thing you hold a
 * place on. The shape does work that a paragraph would otherwise have to do.
 *
 * White body, a perforation notched at the mark's angle, black stub. One
 * corner is cut; the stub is where the action lives.
 */
function TicketShell({
  kicker,
  title,
  line,
  stub,
  headingLevel: Heading = "h3",
  headingId,
  className = "",
}: {
  kicker: string;
  title: string;
  line?: string | null;
  stub: React.ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
  headingId?: string;
  className?: string;
}) {
  return (
    <CutFrame corner="tr" className={className} innerClassName="flex flex-col">
      <article>
      <div className="p-6 sm:p-7">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">{kicker}</p>
        <Heading id={headingId} className="text-title mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
          {title}
        </Heading>
        {line ? <p className="mt-3 max-w-[38ch] leading-[1.5] text-muted-foreground">{line}</p> : null}
      </div>

      <Perforation />

      <div className="bg-foreground p-6 text-background sm:p-7">{stub}</div>
      </article>
    </CutFrame>
  );
}

/** The tear line: dashed, with notches cut at the angle where a ticket would have semicircles. */
function Perforation() {
  return (
    <div aria-hidden="true" className="relative h-0">
      <div className="absolute inset-x-5 -top-px border-t-2 border-dashed border-foreground/30" />
      <Notch side="left" />
      <Notch side="right" />
    </div>
  );
}

/**
 * Two stacked triangles: the outer one is the ticket's border colour, the
 * inner one the page behind it, so the cut keeps its outline. Width to height
 * is 1 : 2.926, which puts both edges on the mark's angle.
 */
function Notch({ side }: { side: "left" | "right" }) {
  const shape =
    side === "left" ? "polygon(0 0, 100% 50%, 0 100%)" : "polygon(100% 0, 0 50%, 100% 100%)";

  return (
    <div
      className={`absolute top-1/2 h-[1.463rem] w-[0.5rem] -translate-y-1/2 bg-foreground ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ clipPath: shape }}
    >
      <div
        className={`absolute h-full w-full bg-background ${side === "left" ? "-left-[2px]" : "left-[2px]"}`}
        style={{ clipPath: shape }}
      />
    </div>
  );
}

function StubDate({ day, month, when, startsAt }: { day: string; month: string; when: string; startsAt: string }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <p className="flex items-baseline gap-2">
        <span className="text-[3.25rem] leading-[0.8] font-extrabold tabular-nums">{day}</span>
        <span className="text-lg font-semibold text-background/80">{month}</span>
      </p>
      <p className="text-right text-[0.9375rem] leading-[1.4]">
        <RelativeLabel startsAt={startsAt} className="block font-semibold" />
        <span className="block text-background/75">{when}</span>
      </p>
    </div>
  );
}

/**
 * The next event, as a ticket. Registration is the action; when it is full the
 * action becomes wherever somebody should go instead.
 */
export function EventTicket({
  event,
  next,
  action,
  headingLevel,
  headingId,
  className,
}: {
  event: PublicEvent;
  /** Where to send somebody when this one is full. */
  next: { href: string; label: string };
  /** Defaults to the event's own page; the event page itself points at its form. */
  action?: { href: string; label: string };
  headingLevel?: "h1" | "h2" | "h3";
  headingId?: string;
  className?: string;
}) {
  const { day, month, when } = ticketDate(event.startsAt);
  const places = placesNote(event);
  const state = registrationState(event);

  const closed = (
    <Note
      heading={state === "full" ? "This one is full." : "This one has started."}
      link={next}
    />
  );

  return (
    <TicketShell
      kicker={eventLabel(event)}
      title={event.title}
      line={firstSentence(event.description)}
      headingLevel={headingLevel}
      headingId={headingId}
      className={className}
      stub={
        <>
          <StubDate day={day} month={month} when={when} startsAt={event.startsAt} />
          {state !== "open" ? (
            closed
          ) : (
            <Started startsAt={event.startsAt} fallback={closed}>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href={action?.href ?? `/events/${event.slug}`}>{action?.label ?? eventAction(event)}</Link>
              </Button>
              {places ? <p className="mt-3 text-[0.9375rem] text-background/80">{places}</p> : null}
            </Started>
          )}
        </>
      }
    />
  );
}

/** Why an action is not on offer, and where to go instead. */
function Note({ heading, link }: { heading: string; link: { href: string; label: string } }) {
  return (
    <div className="mt-6">
      <p className="text-lg font-semibold">{heading}</p>
      <Link href={link.href} className="mt-1 inline-block underline underline-offset-4 hover:no-underline">
        {link.label}
      </Link>
    </div>
  );
}

/** The same shape for a cohort, when there is no event to show. */
export function ProgrammeTicket({
  program,
  headingLevel,
  headingId,
  className,
}: {
  program: PublicProgram;
  headingLevel?: "h1" | "h2" | "h3";
  headingId?: string;
  className?: string;
}) {
  const date = program.startsAt ? ticketDate(program.startsAt) : null;
  const open = enrolmentState(program) === "open";
  const places = placesNote(program);

  return (
    <TicketShell
      kicker={open ? "Programme · Enrolling now" : "Programme"}
      title={program.title}
      line={firstSentence(program.summary)}
      headingLevel={headingLevel}
      headingId={headingId}
      className={className}
      stub={
        <>
          {date && program.startsAt ? (
            <StubDate day={date.day} month={date.month} when="Cohort starts" startsAt={program.startsAt} />
          ) : (
            <p className="text-lg font-semibold">{priceAndCohort(program)}</p>
          )}
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href={`/programmes/${program.slug}`}>{open ? "Enrol" : "See the programme"}</Link>
          </Button>
          {open && places ? <p className="mt-3 text-[0.9375rem] text-background/80">{places}</p> : null}
        </>
      }
    />
  );
}

/** Nothing scheduled and nothing enrolling: the community is still a real next step. */
export function CommunityTicket({
  headingLevel,
  headingId,
  className,
}: {
  headingLevel?: "h1" | "h2" | "h3";
  headingId?: string;
  className?: string;
}) {
  return (
    <TicketShell
      kicker="Community · Free"
      title="Start in the community"
      line="Hear about the next webinar before it is announced publicly."
      headingLevel={headingLevel}
      headingId={headingId}
      className={className}
      stub={
        <Button asChild size="lg" className="w-full">
          <Link href="/community">Join the community</Link>
        </Button>
      }
    />
  );
}

/**
 * The list version: the same language, laid on its side. Title on the left,
 * black stub on the right, stacking on a phone.
 */
export function EventTicketRow({
  event,
  headingLevel: Heading = "h3",
}: {
  event: PublicEvent;
  headingLevel?: "h2" | "h3";
}) {
  const { day, month, when } = ticketDate(event.startsAt);
  const places = placesNote(event);
  const state = registrationState(event);

  return (
    <CutFrame corner="tr">
      <article className="grid sm:grid-cols-[1fr_16rem]">
      <div className="p-5 sm:p-6">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">{eventLabel(event)}</p>
        <Heading className="text-title mt-2 text-2xl">
          <Link href={`/events/${event.slug}`} className="hover:underline hover:underline-offset-4">
            {event.title}
          </Link>
        </Heading>
        {event.format === "in_person" && event.venue ? (
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">{event.venue.name}</p>
        ) : null}
      </div>

      <div className="flex flex-col justify-between gap-4 bg-foreground p-5 text-background sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="flex items-baseline gap-2">
            <span className="text-3xl leading-none font-extrabold tabular-nums">{day}</span>
            <span className="font-semibold text-background/80">{month}</span>
          </p>
          <RelativeLabel startsAt={event.startsAt} className="text-[0.9375rem] font-semibold" />
        </div>
        <p className="text-[0.9375rem] text-background/75">{when}</p>
        {state !== "open" ? (
          <p className="font-semibold">{state === "full" ? "This one is full." : "This one has started."}</p>
        ) : (
          <Started
            startsAt={event.startsAt}
            fallback={<p className="font-semibold">This one has started.</p>}
          >
            <Button asChild className="w-full">
              <Link href={`/events/${event.slug}`} aria-label={`${eventAction(event)}: ${event.title}`}>
                {eventAction(event)}
              </Link>
            </Button>
            {places ? <p className="text-[0.9375rem] text-background/80">{places}</p> : null}
          </Started>
        )}
      </div>
      </article>
    </CutFrame>
  );
}
