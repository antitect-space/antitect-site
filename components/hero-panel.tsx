import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { PublicEvent, PublicProgram } from "@/lib/api";
import { eventAction, eventLabel } from "@/lib/events";
import { formatShortWhen } from "@/lib/format";
import { commitmentSentence, priceAndCohort } from "@/lib/programs";

/**
 * The hero's right-hand panel: hard-edged, black, and always carrying real
 * content. The next event; otherwise the next programme; otherwise the
 * community. Never empty, never "coming soon".
 *
 * White on black only. Red appears as a fill, never as text, because red text
 * on this black fails contrast.
 */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <aside
      aria-labelledby="next-up"
      className="flex flex-col justify-between gap-10 bg-foreground p-6 text-background sm:p-8 lg:min-h-[26rem] lg:p-10"
    >
      {children}
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p id="next-up" className="text-[0.9375rem] font-medium text-background/70">
      {children}
    </p>
  );
}

export function HeroPanel({ event, program }: { event: PublicEvent | null; program: PublicProgram | null }) {
  if (event) {
    return (
      <Panel>
        <div>
          <Label>Next up</Label>
          <p className="text-title mt-3 text-3xl sm:text-4xl">{event.title}</p>
          <p className="mt-5 text-lg leading-[1.5] font-medium">
            {eventLabel(event)}
            <br />
            {formatShortWhen(event.startsAt)}
          </p>
        </div>
        {event.isFull ? (
          <p className="text-lg font-semibold">Every place has been taken.</p>
        ) : (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/events/${event.slug}`}>{eventAction(event)}</Link>
          </Button>
        )}
      </Panel>
    );
  }

  if (program) {
    const commitment = commitmentSentence(program);
    return (
      <Panel>
        <div>
          <Label>Next programme</Label>
          <p className="text-title mt-3 text-3xl sm:text-4xl">{program.title}</p>
          <p className="mt-5 max-w-[42ch] text-lg leading-[1.5] text-background/85">
            {commitment ?? program.summary}
          </p>
          <p className="mt-4 font-semibold">{priceAndCohort(program)}</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/programmes/${program.slug}`}>Enrol</Link>
        </Button>
      </Panel>
    );
  }

  return (
    <Panel>
      <div>
        <Label>Start here</Label>
        <p className="text-title mt-3 text-3xl sm:text-4xl">The Antitect community</p>
        <p className="mt-5 max-w-[42ch] text-lg leading-[1.5] text-background/85">
          Hear about webinars before they are announced publicly, and build alongside people doing the
          same thing. Free to join.
        </p>
      </div>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href="/community">Join the community</Link>
      </Button>
    </Panel>
  );
}
