import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Covers drafts and cancelled events too. Never say why: the API makes them
 * indistinguishable on purpose.
 */
export default function EventNotFound() {
  return (
    <div className="container-page py-20 lg:py-28">
      <h1 className="text-display text-4xl sm:text-5xl">This event does not exist.</h1>
      <Button asChild variant="secondary" size="lg" className="mt-8">
        <Link href="/events">See upcoming events</Link>
      </Button>
    </div>
  );
}
