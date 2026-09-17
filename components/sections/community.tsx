import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * For everyone not ready for a webinar or a programme yet. Black, so it reads
 * as the page's closing offer rather than one more block.
 *
 * The action leads to /community rather than holding the form here: the form
 * brings its validation code with it, and the home page is the one most
 * visitors open on mobile data.
 */
export function CommunitySection() {
  return (
    <section id="community" aria-labelledby="community-title" className="scroll-mt-4 bg-foreground text-background">
      <div className="container-page grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-20 lg:py-24">
        <div>
          <h2 id="community-title" className="text-display text-4xl sm:text-5xl">
            Be a builder, not just a spectator.
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg leading-[1.6] text-background/80">
            Antitect&apos;s community is where most people start. You will hear about webinars before they are
            announced publicly, get practical resources, and build alongside people doing the same thing.
          </p>
        </div>
        <div className="lg:justify-self-end">
          <p className="text-lg font-semibold">Free to join.</p>
          <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
            <Link href="/community">Join the community</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
