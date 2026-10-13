import { BackLink } from "@/components/detail/back-link";
import { EventStatus } from "@/components/live";
import type { PublicEvent } from "@/lib/api";
import type { EventPhase } from "@/lib/events";

/**
 * The head of a webinar's or workshop's page (design "Webinar · Open",
 * "Intro"): the back link, the meta line with its live half ("In 9 days",
 * "Happening now", "Ended"), the H1, the promise, then whatever the page puts
 * under it ("When and where").
 */
export function EventHead({
  event,
  label,
  back,
  lead,
  initialPhase,
  status = true,
  children,
}: {
  event: Pick<PublicEvent, "title" | "startsAt" | "endsAt">;
  /** "Free webinar · Online". */
  label: string;
  back: { label: string; href: string };
  lead: string | null;
  initialPhase: EventPhase;
  /** False where the meta line already says what it needs, such as "Recorded on …". */
  status?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <div className="flex flex-col gap-4 lg:gap-6">
        <BackLink href={back.href} label={back.label} />
        <div className="flex flex-col gap-3 lg:gap-4">
          <p className="type-meta font-medium text-ink-muted tabular-nums">
            {label}
            {status ? (
              <EventStatus startsAt={event.startsAt} endsAt={event.endsAt} initialPhase={initialPhase} prefix=" · " />
            ) : null}
          </p>
          <h1 className="type-h1 text-ink">{event.title}</h1>
          {lead ? <p className="type-lead text-ink-muted">{lead}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
