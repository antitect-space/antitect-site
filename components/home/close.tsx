import Link from "next/link";

import { Button } from "@/components/ui/button";
import { close } from "@/content/home";
import { filled } from "@/lib/content";

/**
 * The page closes on the community (Home B, section 7): the free way in, and
 * how people hear about everything else. Its "Join free" is the red button on
 * this screen.
 */
export function CloseSection() {
  return (
    <section aria-labelledby="close-title" className="bg-wash py-16 lg:py-24">
      <div className="container-site grid gap-5 lg:grid-cols-2 lg:gap-6">
        <h2 id="close-title" className="type-h2 text-ink">
          {close.title}
        </h2>

        <div className="flex flex-col gap-5 lg:gap-6">
          <div className="flex flex-col gap-2">
            <p className="type-body max-w-[520px] text-ink-muted">{close.body}</p>
            {filled(close.cadence) ? <p className="type-body max-w-[520px] text-ink-muted">{close.cadence}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-3 pt-2">
            <Button asChild size="lg" className="px-5">
              <Link href={close.action.href}>{close.action.label}</Link>
            </Button>
            <p className="type-meta font-medium text-ink-muted">{close.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
