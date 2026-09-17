import Link from "next/link";

import { HeroPanel } from "@/components/hero-panel";
import { Button } from "@/components/ui/button";
import type { PublicEvent, PublicProgram } from "@/lib/api";

export function Hero({ event, program }: { event: PublicEvent | null; program: PublicProgram | null }) {
  return (
    <section aria-labelledby="hero-title" className="border-b">
      <div className="container-page grid gap-10 py-10 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-24">
        <div className="flex flex-col justify-center">
          <h1 id="hero-title" className="text-display text-[2.75rem] sm:text-6xl lg:text-7xl">
            Learn AI by building with it.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-[1.6] text-muted-foreground">
            Antitect runs hands-on AI programmes in Nigeria for people who want to leave with something
            they built — not notes they will never open again.
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
        <HeroPanel event={event} program={program} />
      </div>
    </section>
  );
}
