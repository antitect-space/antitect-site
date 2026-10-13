"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Panel } from "@/components/detail/panel";
import { CommunityForm } from "@/components/forms/community-form";
import { FormHead } from "@/components/forms/fields";
import { PaymentForm } from "@/components/forms/payment-form";
import type { NextEvent } from "@/components/forms/registration-states";
import { useEventPhase } from "@/components/live";
import { Button } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/api";
import { eventHref, eventsPath, placesNote, type EventPhase } from "@/lib/events";
import { formatDayShort, hasStarted } from "@/lib/format";
import { personInput, type PersonBody } from "@/lib/schemas";

const ID = "register";

export type ReservationEvent = Pick<
  PublicEvent,
  "slug" | "title" | "type" | "startsAt" | "endsAt" | "priceKobo" | "capacity" | "spotsRemaining" | "isFull"
>;

type Refusal = { kind: "full" | "closed"; person: PersonBody };

/**
 * A paid event's panel (design C7): the reservation form, in one step,
 * before the start; "full" with the community form when every place has
 * gone; "happening now" until the end; then "ended" with the next session,
 * or with the community form when nothing is scheduled.
 *
 * The page decides the state when it renders (`initialPhase`); the browser
 * decides again once it knows the time, as the registration panel does. When
 * the API refuses a reservation the page was too old to know about, the
 * panel shows the state it should have shown, with the details already typed.
 */
export function ReservationPanel({
  event,
  initialPhase,
  next,
}: {
  event: ReservationEvent;
  initialPhase: EventPhase;
  /** The next upcoming session of the same kind, offered once this one has ended. */
  next: NextEvent | null;
}) {
  const phase = useEventPhase(event.startsAt, event.endsAt) ?? initialPhase;
  const [refused, setRefused] = useState<Refusal | null>(null);
  const kind = event.type === "workshop" ? "workshop" : "webinar";

  let body: React.ReactNode;
  if (phase === "live" || (refused?.kind === "closed" && hasStarted(event.startsAt))) {
    body = <Happening kind={kind} type={event.type} focus={refused !== null} />;
  } else if (phase === "over") {
    body = <Ended kind={kind} next={next} />;
  } else if (event.isFull || refused?.kind === "full") {
    body = <Full person={refused?.person ?? null} />;
  } else if (refused?.kind === "closed") {
    body = <Closed type={event.type} kind={kind} />;
  } else {
    body = (
      <PaymentForm
        payable={{ kind: "event", slug: event.slug }}
        title={event.title}
        priceKobo={event.priceKobo}
        closesAt={event.startsAt}
        places={placesNote(event)}
        idPrefix={ID}
        noun={kind}
        onRefused={(refusal, person) => setRefused({ kind: refusal, person })}
      />
    );
  }

  return (
    <Panel id={ID} aria-labelledby={`${ID}-title`} className="scroll-mt-8">
      {body}
    </Panel>
  );
}

function useFocus<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);
  return ref;
}

/** Every place has gone. Whoever typed their details for one keeps them for the community. */
function Full({ person }: { person: PersonBody | null }) {
  const headingRef = useFocus<HTMLHeadingElement>(person !== null);
  const [joined, setJoined] = useState(false);
  return (
    <div role={person ? "status" : undefined} className="flex flex-col gap-5">
      <FormHead
        id={`${ID}-title`}
        headingRef={headingRef}
        title="Every place has been taken."
        line={joined ? undefined : "Join the community to hear first when the next one opens."}
      />
      <CommunityForm
        idPrefix={`${ID}-community`}
        variant="inline"
        defaults={person ? personInput(person) : undefined}
        onJoined={() => setJoined(true)}
      />
    </div>
  );
}

function Happening({ kind, type, focus }: { kind: string; type: PublicEvent["type"]; focus: boolean }) {
  const headingRef = useFocus<HTMLHeadingElement>(focus);
  return (
    <div role={focus ? "status" : undefined} className="flex flex-col gap-6">
      <FormHead id={`${ID}-title`} headingRef={headingRef} title={`This ${kind} is happening now.`} />
      <UpcomingButton type={type} kind={kind} />
    </div>
  );
}

/** Closed before the start: switched off in the CRM after the page was cached. */
function Closed({ kind, type }: { kind: string; type: PublicEvent["type"] }) {
  const headingRef = useFocus<HTMLHeadingElement>(true);
  return (
    <div role="status" className="flex flex-col gap-6">
      <FormHead id={`${ID}-title`} headingRef={headingRef} title="Reservations have closed." />
      <UpcomingButton type={type} kind={kind} />
    </div>
  );
}

function UpcomingButton({ kind, type }: { kind: string; type: PublicEvent["type"] }) {
  return (
    <Button asChild variant="outline" size="lg" className="w-full px-5">
      <Link href={eventsPath(type)}>See upcoming {kind}s</Link>
    </Button>
  );
}

/** Over, with no recap: the next one when there is one, otherwise the community. */
function Ended({ kind, next }: { kind: string; next: NextEvent | null }) {
  const [joined, setJoined] = useState(false);

  if (!next) {
    return (
      <div className="flex flex-col gap-5">
        <FormHead
          id={`${ID}-title`}
          title={`This ${kind} has ended.`}
          line={joined ? undefined : "Join the community to hear first when the next one opens."}
        />
        <CommunityForm idPrefix={`${ID}-community`} variant="inline" onJoined={() => setJoined(true)} />
      </div>
    );
  }

  const nextKind = next.type === "workshop" ? "workshop" : "webinar";
  const where = next.format === "in_person" ? (next.venue?.name ?? null) : "Online";
  const action = next.priceKobo > 0 ? "Reserve your place" : "Register free";

  return (
    <div className="flex flex-col gap-6">
      <FormHead id={`${ID}-title`} title={`This ${kind} has ended.`} />
      <div className="flex flex-col gap-3">
        <p className="type-meta font-medium text-ink-muted">Next {nextKind}</p>
        <p className="type-h3 text-ink">{next.title}</p>
        <p className="type-small text-ink-muted tabular-nums">
          <time dateTime={next.startsAt}>{formatDayShort(next.startsAt)}</time>
          {where ? ` · ${where}` : null}
        </p>
        <div className="pt-3">
          <Button asChild size="lg" className="w-full px-5">
            <Link href={`${eventHref(next)}#register`} aria-label={`${action}: ${next.title}`}>
              {action}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
