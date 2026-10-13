import Link from "next/link";

import { Panel } from "@/components/detail/panel";
import { CommunityForm } from "@/components/forms/community-form";
import { Button } from "@/components/ui/button";
import type { PublicEvent } from "@/lib/api";
import { eventHref, isPaid } from "@/lib/events";
import { formatDayShort, formatShortWhen } from "@/lib/format";

/**
 * The side card on a recording or recap page (design W7, and C8's "Side card
 * · Next workshop"): in the right-hand columns, sticking like the panel. With
 * another session scheduled it offers that one, with its date in WAT and the
 * red button; with none it holds the community form under its own heading.
 */
export function NextSessionCard({
  next,
  type,
}: {
  /** The next upcoming session of this kind, or null. */
  next: Pick<PublicEvent, "slug" | "type" | "title" | "startsAt" | "priceKobo" | "format" | "venue"> | null;
  type: PublicEvent["type"];
}) {
  const workshop = type === "workshop";

  if (!next) {
    return (
      <Panel aria-labelledby="side-card-title" className="gap-4">
        <h2 id="side-card-title" className="type-h3 text-ink">
          {workshop ? "Hear when the next one opens" : "Hear about the next one"}
        </h2>
        <CommunityForm idPrefix="side-card" variant="inline" />
      </Panel>
    );
  }

  const paid = isPaid(next);
  const action = paid ? "Reserve your place" : "Register free";
  const when = workshop ? formatDayShort(next.startsAt) : formatShortWhen(next.startsAt);
  const where = next.format === "in_person" ? (next.venue?.name ?? null) : null;

  return (
    <Panel aria-labelledby="side-card-title" className="gap-4">
      <div className="flex flex-col gap-3">
        <p className="type-meta font-medium text-ink-muted">
          {workshop ? "Next workshop" : paid ? "Next webinar" : "Next free webinar"}
        </p>
        <h2 id="side-card-title" className="type-h3 text-ink">
          <Link href={eventHref(next)} className="underline-offset-4 hover:underline">
            {next.title}
          </Link>
        </h2>
        <p className="type-meta text-ink-muted tabular-nums">
          <time dateTime={next.startsAt}>{when}</time>
          {where ? ` · ${where}` : null}
        </p>
      </div>
      <Button asChild size="lg" className="w-full px-5">
        <Link href={`${eventHref(next)}#register`} aria-label={`${action}: ${next.title}`}>
          {action}
        </Link>
      </Button>
    </Panel>
  );
}
