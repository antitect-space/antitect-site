import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Covers drafts and cancelled programmes too. Never say why. */
export default function ProgrammeNotFound() {
  return (
    <div className="container-page py-20 lg:py-28">
      <h1 className="text-display text-4xl sm:text-5xl">This programme does not exist.</h1>
      <Button asChild variant="secondary" size="lg" className="mt-8">
        <Link href="/programmes">See our programmes</Link>
      </Button>
    </div>
  );
}
