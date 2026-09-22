import Link from "next/link";

import { LogOut } from "@/components/learner/log-out";
import { Logo } from "@/components/logo";

/**
 * The learner's header: where they are, and the way out. No marketing nav —
 * somebody who has paid and is mid-programme is not being sold to.
 *
 * More arrives with the pages that need it: the schedule and projects links
 * once those exist, and a programme switcher for anybody on more than one.
 */
export function LearnerHeader() {
  return (
    <header className="border-b">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/learn" className="inline-flex" aria-label="Your programme">
          <Logo />
        </Link>
        <LogOut />
      </div>
    </header>
  );
}
