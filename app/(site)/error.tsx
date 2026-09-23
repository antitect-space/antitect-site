"use client";

import { Button } from "@/components/ui/button";

/** Reached only when there is no cached page to fall back on, e.g. the API is down on a first visit. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page py-20 lg:py-28">
      <h1 className="text-display text-4xl sm:text-5xl">We could not load this page.</h1>
      <p className="mt-6 max-w-[55ch] text-lg leading-[1.6] text-muted-foreground">
        This is usually brief. Check your connection and try again in a moment.
      </p>
      <Button variant="secondary" size="lg" className="mt-8" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
