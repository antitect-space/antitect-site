"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CONTACT } from "@/lib/site";

/** Nothing under /teach has a cached copy to fall back on. */
export default function TutorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="container-page flex-1 py-20 lg:py-28">
      <h1 className="text-display text-4xl sm:text-5xl">We could not load your runs.</h1>
      <p className="mt-6 max-w-[55ch] text-lg leading-[1.6] text-muted-foreground">
        This is usually brief. Try again in a moment, and if it keeps happening write to{" "}
        <a
          href={`mailto:${CONTACT.email}`}
          className="underline underline-offset-4 hover:no-underline"
        >
          {CONTACT.email}
        </a>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="secondary" size="lg" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/teach/login">Sign in again</Link>
        </Button>
      </div>
    </main>
  );
}
