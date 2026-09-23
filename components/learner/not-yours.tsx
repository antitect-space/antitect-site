import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Signed in, but this run is somebody else's.
 *
 * It stays on the page rather than redirecting to the sign-in form: sending
 * somebody who is already signed in back to a login screen tells them nothing
 * and loops them straight back here.
 */
export function NotYourProgramme() {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">
        You are not enrolled in this programme.
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
        If you think you should be, write to us and we will sort it out.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/learn">Back to your programme</Link>
      </Button>
    </div>
  );
}
