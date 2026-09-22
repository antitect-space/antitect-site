import Image from "next/image";
import Link from "next/link";

import { Cut } from "@/components/cut";
import { Fresh } from "@/components/live";
import { Reveal } from "@/components/motion/reveal";
import {
  CommunityTicket,
  EventTicket,
  ProgrammeTicket,
} from "@/components/ticket";
import { Button } from "@/components/ui/button";
import { heroPhoto } from "@/content/gallery";
import type { PublicEvent, PublicProgram } from "@/lib/api";

/**
 * The page opens on a blade: a red diagonal at the mark's angle, passing
 * behind the headline block and out the other side. The headline sits on the
 * page's own white, so the blade never runs under type — red under black
 * fails contrast, and the blade is there to cut, not to tint.
 *
 * Beside it, the ticket: the next real thing somebody can hold a place at.
 */
export function Hero({
  event,
  program,
}: {
  event: PublicEvent | null;
  program: PublicProgram | null;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b"
    >
      <Reveal
        kind="blade"
        trigger="load"
        className="pointer-events-none absolute -top-16 left-[52%] h-[150%] w-[5rem] sm:left-[58%] sm:w-[7rem] lg:left-[33%] lg:w-[8.5rem]"
      >
        <div aria-hidden="true" className="blade h-full w-full" />
      </Reveal>

      <div className="container-page relative grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div className="relative self-start bg-background py-3 lg:max-w-[33rem] lg:py-8">
          <h1
            id="hero-title"
            className="text-display text-[2.75rem] sm:text-6xl lg:text-7xl"
          >
            Learn AI by building with it.
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-muted-foreground sm:text-xl">
            Learn what you need. Build what you learn. Develop capabilities you
            can actually apply.{" "}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/community">Join the community</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/events">See what&apos;s coming up</Link>
            </Button>
          </div>
        </div>

        <div className="relative flex flex-col gap-6">
          <NextUp event={event} program={program} />

          <Cut
            corner="bl"
            className="relative aspect-[4/3] w-full overflow-hidden bg-muted lg:order-first"
          >
            <Image
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              fill
              priority
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="object-cover"
            />
          </Cut>
        </div>
      </div>
    </section>
  );
}

/**
 * The ticket, or the next best real thing. Never empty, and never "coming
 * soon": a cohort, or the community, is always something somebody can do now.
 *
 * `Fresh` is the last guard against a page that has been sitting in a cache:
 * once the browser knows the time, a finished event stops inviting anybody.
 */
function NextUp({
  event,
  program,
}: {
  event: PublicEvent | null;
  program: PublicProgram | null;
}) {
  const fallback = program ? (
    <ProgrammeTicket program={program} headingId="next-up" />
  ) : (
    <CommunityTicket headingId="next-up" />
  );

  if (!event) return fallback;

  return (
    <Fresh startsAt={event.startsAt} fallback={fallback}>
      <EventTicket
        event={event}
        headingId="next-up"
        next={
          program
            ? {
                href: `/programmes/${program.slug}`,
                label: "See the programme",
              }
            : { href: "/community", label: "Join the community" }
        }
      />
    </Fresh>
  );
}
