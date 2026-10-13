"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { FormHead } from "@/components/forms/fields";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { PublicEvent, RegistrationResponse } from "@/lib/api";
import { googleCalendarUrl } from "@/lib/calendar";
import { eventHref, eventsPath, isPaid } from "@/lib/events";
import { firstParagraph, formatShortWhen, summarise } from "@/lib/format";
import { CONTACT, JOIN_FREE, absoluteUrl, communityLink } from "@/lib/site";

/**
 * What the registration panel says when it is not a form (design W5):
 * registered, already registered, full, started and ended. Each opens with
 * the panel's heading, `${idPrefix}-title`, which labels the panel.
 *
 * Focus moves to the heading only when the change answers something the
 * person did (a submit), so a screen reader announces it. A page that simply
 * opens on a started or ended session leaves focus where it is.
 */

export type RegistrationEvent = Pick<
  PublicEvent,
  "slug" | "title" | "description" | "type" | "format" | "venue" | "startsAt" | "endsAt" | "capacity" | "spotsRemaining" | "isFull"
>;

export type NextEvent = Pick<PublicEvent, "slug" | "title" | "type" | "format" | "venue" | "startsAt" | "priceKobo">;

function useFocusOnMount<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);
  return ref;
}

/** "webinar" or "workshop", for the sentences that name the format. */
function kindOf(type: PublicEvent["type"]): string {
  return type === "workshop" ? "workshop" : "webinar";
}

function UpcomingLink({ type, variant }: { type: PublicEvent["type"]; variant: "text" | "outline" }) {
  const label = `See upcoming ${kindOf(type)}s`;
  return variant === "text" ? (
    <Button asChild variant="text" className="self-start">
      <Link href={eventsPath(type)}>
        {label}
        <ArrowRight />
      </Link>
    </Button>
  ) : (
    <Button asChild variant="outline" size="lg" className="w-full px-5">
      <Link href={eventsPath(type)}>{label}</Link>
    </Button>
  );
}

/** Registered, or registered already. The form's red button has gone, so the community invite takes its place. */
export function Registered({
  idPrefix,
  event,
  response,
}: {
  idPrefix: string;
  event: RegistrationEvent;
  response: Pick<RegistrationResponse, "alreadyRegistered" | "sentTo">;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(true);
  const { alreadyRegistered: repeat, sentTo } = response;
  const community = communityLink();

  const line = !sentTo
    ? `Your place for ${event.title} is saved.`
    : repeat
      ? `We sent the details to ${sentTo} when you first signed up.`
      : `We’ve emailed the details for ${event.title} to ${sentTo}.`;
  const help = !sentTo
    ? "Questions? Write to "
    : repeat
      ? "Can’t find them? Check your spam folder, or write to "
      : "Not there in a few minutes? Check your spam folder, or write to ";

  const calendar = googleCalendarUrl({
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    details: [summarise(firstParagraph(event.description), 300), absoluteUrl(eventHref(event))]
      .filter(Boolean)
      .join("\n\n"),
    location: event.format === "in_person" && event.venue ? `${event.venue.name}, ${event.venue.address}` : "Online",
  });

  return (
    <div role="status" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FormHead
          id={`${idPrefix}-title`}
          headingRef={headingRef}
          title={repeat ? "You’re already registered." : "You’re registered."}
        />
        <p className="type-body text-ink">{line}</p>
        <p className="type-meta font-medium text-ink-muted">
          {help}
          <a href={`mailto:${CONTACT.email}`} className="text-ink underline underline-offset-4">
            {CONTACT.email}
          </a>
          .
        </p>
        <Button asChild variant="outline" size="lg" className="w-full px-5">
          <a href={calendar} target="_blank" rel="noopener noreferrer">
            Add to Google Calendar
          </a>
        </Button>
      </div>

      <div className="flex flex-col gap-4 border-t border-rule pt-6">
        <p className="type-body text-ink-muted">
          Join the WhatsApp community too. You’ll hear about the next {kindOf(event.type)} first.
        </p>
        <Button asChild size="lg" className="w-full px-5">
          <a href={community.href} target="_blank" rel="noopener noreferrer">
            {community.label}
          </a>
        </Button>
      </div>
    </div>
  );
}

/** Every place has gone: the community, then the other sessions. */
export function RegistrationFull({
  idPrefix,
  type,
  focus = false,
}: {
  idPrefix: string;
  type: PublicEvent["type"];
  focus?: boolean;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focus);
  return (
    <div role={focus ? "status" : undefined} className="flex flex-col gap-4">
      <FormHead
        id={`${idPrefix}-title`}
        headingRef={headingRef}
        title="Every place has been taken."
        line="Join the community to hear about the next one first."
      />
      <div className="flex flex-col gap-1 pt-2">
        <Button asChild size="lg" className="w-full px-5">
          <Link href={JOIN_FREE.href}>Join the community</Link>
        </Button>
        <UpcomingLink type={type} variant="text" />
      </div>
    </div>
  );
}

/** From the start until the end. Never the joining link: that is only in the reminders. */
export function SessionStarted({
  idPrefix,
  event,
  focus = false,
}: {
  idPrefix: string;
  event: Pick<RegistrationEvent, "type" | "format">;
  focus?: boolean;
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focus);
  return (
    <div role={focus ? "status" : undefined} className="flex flex-col gap-4">
      <FormHead
        id={`${idPrefix}-title`}
        headingRef={headingRef}
        title="This session has started."
        line={
          event.format === "in_person"
            ? "If you registered, the details are in your confirmation email."
            : "If you registered, your joining link is in your reminders."
        }
      />
      <div className="pt-2">
        <UpcomingLink type={event.type} variant="outline" />
      </div>
    </div>
  );
}

/**
 * Over, with no recording to show. With another session scheduled, it is
 * offered here; with none, `community` (the inline community form) is.
 */
export function SessionEnded({
  idPrefix,
  type,
  next,
  community,
}: {
  idPrefix: string;
  type: PublicEvent["type"];
  next: NextEvent | null;
  community: React.ReactNode;
}) {
  const kind = kindOf(type);

  if (!next) {
    return (
      <div className="flex flex-col gap-5">
        <FormHead
          id={`${idPrefix}-title`}
          title={`This ${kind} has ended.`}
          line="Join the community and you’ll hear about the next one first."
        />
        {community}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormHead id={`${idPrefix}-title`} title={`This ${kind} has ended.`} />
      <div className="flex flex-col gap-3 border-t border-rule pt-5">
        <p className="type-meta font-medium text-ink-muted">
          {isPaid(next) ? `Next ${kindOf(next.type)}` : `Next free ${kindOf(next.type)}`}
        </p>
        <p className="font-display text-[1.3125rem] leading-[1.15] font-semibold text-ink">{next.title}</p>
        <p className="type-meta text-ink-muted tabular-nums">
          <time dateTime={next.startsAt}>{formatShortWhen(next.startsAt)}</time>
        </p>
        <div className="pt-1">
          <Button asChild size="lg" className="w-full px-5">
            <Link href={`${eventHref(next)}#register`} aria-label={`${isPaid(next) ? "Reserve your place" : "Register free"}: ${next.title}`}>
              {isPaid(next) ? "Reserve your place" : "Register free"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
