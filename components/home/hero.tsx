import Link from "next/link";

import { LiveLine } from "@/components/home/live-line";
import { Orbit, OrbitSmall } from "@/components/home/orbit";
import { ProofStrip } from "@/components/home/proof-strip";
import { Button } from "@/components/ui/button";
import { hero } from "@/content/home";
import type { PublicEvent } from "@/lib/api";

/**
 * The orbit hero (Home B): everything centred, with the rings and the tools
 * around it on a desktop, and the handover card as the thing to look at.
 * The red button is the page's one action on this screen, and it sits on the
 * first screen at 1440 × 900 and at 390 × 844.
 */
export function OrbitHero({ webinar, card }: { webinar: PublicEvent | null; card?: React.ReactNode }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-rule">
      <Orbit />

      <div className="container-site relative flex flex-col items-center pt-8 pb-16 text-center lg:pt-12 lg:pb-24">
        <LiveLine webinar={webinar} />

        <h1 id="hero-title" className="type-h1 mt-6 max-w-[900px] text-ink lg:mt-8">
          {hero.title}
        </h1>
        <p className="type-lead mt-4 max-w-[560px] text-ink-muted lg:mt-6">{hero.lead}</p>

        <div className="mt-6 flex w-full flex-col gap-3 lg:mt-8 lg:w-auto lg:flex-row lg:gap-4">
          <Button asChild size="lg" className="px-5">
            <Link href={hero.primary.href}>{hero.primary.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-5">
            <Link href={hero.secondary.href}>{hero.secondary.label}</Link>
          </Button>
        </div>

        <div className="relative mt-12 w-full max-w-[720px] text-left lg:mt-16">
          <OrbitSmall />
          {card}
        </div>

        <div className="mt-12 w-full lg:mt-16 lg:w-auto">
          <ProofStrip />
        </div>
      </div>
    </section>
  );
}
