import Link from "next/link";

import { LogOut } from "@/components/area/log-out";
import { Logo } from "@/components/logo";
import { AREA_HOME, type AreaName } from "@/lib/area-view";

/**
 * A signed-in header: where you are, what else there is, and the way out. No
 * marketing nav — somebody who has paid and is mid-programme is not being sold
 * to, and neither is somebody who teaches here.
 *
 * The links wrap onto a second line on a phone rather than folding into a menu
 * behind a button. There are three of them; a menu would be a tap in the way.
 */
export function AreaHeader({
  area,
  label,
  links = [],
}: {
  area: AreaName;
  label: string;
  links?: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <header className="border-b">
      {/* Two rows on a phone — the logo and the way out, then the links —
          and one row from there up. Wrapping them all together left the nav
          broken across lines with the sign-out stranded below it. */}
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <Link href={AREA_HOME[area]} className="order-1 inline-flex" aria-label={label}>
          <Logo />
        </Link>

        <div className="order-2 sm:order-3">
          <LogOut area={area} />
        </div>

        {links.length > 0 ? (
          <nav aria-label={label} className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:justify-end">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.9375rem] font-semibold hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
