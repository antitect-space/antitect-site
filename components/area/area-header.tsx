import Link from "next/link";

import { LogOut } from "@/components/area/log-out";
import { AREA_HOME, type AreaName } from "@/lib/area-view";
import { Logo } from "@/components/logo";

/**
 * The learner's header: where they are, and the way out. No marketing nav —
 * somebody who has paid and is mid-programme is not being sold to.
 *
 * More arrives with the pages that need it: the schedule and projects links
 * once those exist, and a programme switcher for anybody on more than one.
 */
export function AreaHeader({ area, label }: { area: AreaName; label: string }) {
  return (
    <header className="border-b">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={AREA_HOME[area]} className="inline-flex" aria-label={label}>
          <Logo />
        </Link>
        <LogOut area={area} />
      </div>
    </header>
  );
}
