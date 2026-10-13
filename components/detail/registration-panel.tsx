"use client";

import { Panel } from "@/components/detail/panel";
import { CommunityForm } from "@/components/forms/community-form";
import { RegistrationForm } from "@/components/forms/registration-form";
import {
  RegistrationFull,
  SessionEnded,
  SessionStarted,
  type NextEvent,
  type RegistrationEvent,
} from "@/components/forms/registration-states";
import { useEventPhase } from "@/components/live";
import type { EventPhase } from "@/lib/events";

const ID = "register";

/**
 * A free event's panel (design W5), in whichever state the time puts it:
 * the form (or "full") before the start, "started" until the end, then
 * "ended" with the next session, or with the community form when nothing is
 * scheduled.
 *
 * The page decides the state when it renders (`initialPhase`); the browser
 * decides again as soon as it knows the time, because the page may be cached
 * from before the start or the end. The panel is the target of the page's
 * "Register" links and the register bar.
 */
export function RegistrationPanel({
  event,
  initialPhase,
  next,
}: {
  event: RegistrationEvent;
  initialPhase: EventPhase;
  /** The next upcoming session of the same kind, offered once this one has ended. */
  next: NextEvent | null;
}) {
  const phase = useEventPhase(event.startsAt, event.endsAt) ?? initialPhase;

  return (
    <Panel id={ID} aria-labelledby={`${ID}-title`} className="scroll-mt-8">
      {phase === "live" ? (
        <SessionStarted idPrefix={ID} event={event} />
      ) : phase === "over" ? (
        <SessionEnded
          idPrefix={ID}
          type={event.type}
          next={next}
          community={<CommunityForm idPrefix={`${ID}-community`} />}
        />
      ) : event.isFull ? (
        <RegistrationFull idPrefix={ID} type={event.type} />
      ) : (
        <RegistrationForm event={event} idPrefix={ID} />
      )}
    </Panel>
  );
}
