import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * The page closes as it opened: on a blade. Black, notched into the section
 * above it at the mark's angle, with red cutting across behind the type —
 * behind, never under, because red beneath white type fails contrast.
 */
export function CommunitySection() {
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="notch-top relative -mt-[var(--notch-rise)] scroll-mt-4 overflow-hidden bg-foreground text-background"
    >
      <Reveal
        kind="blade"
        className="pointer-events-none absolute -top-10 right-[12%] h-[150%] w-[6rem] sm:w-[9rem] lg:right-[28%]"
      >
        <div aria-hidden="true" className="blade h-full w-full opacity-90" />
      </Reveal>

      <div className="container-page relative grid gap-8 pt-[calc(var(--notch-rise)+3rem)] pb-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16 lg:pb-24">
        <div className="relative bg-foreground py-2">
          <h2 id="community-title" className="text-display text-4xl sm:text-5xl lg:text-6xl">
            Be a builder, not just a spectator.
          </h2>
          <p className="mt-6 max-w-[40ch] text-lg leading-[1.5] text-background/80">
            Hear about webinars before they are announced, and build alongside people doing the same thing.
          </p>
            <div className="relative lg:justify-self-start mt-5">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/community">Join the community</Link>
          </Button>
        </div>
        </div>
      
      </div>
    </section>
  );
}
