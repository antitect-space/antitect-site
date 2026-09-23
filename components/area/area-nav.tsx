"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The links across a signed-in area, with the one you are on underlined.
 *
 * `aria-current` carries the same fact to a screen reader, so the underline is
 * not the only way to know where you are. A child page counts as its section —
 * reading a project is still being in Projects.
 */
export function AreaNav({
  label,
  links,
}: {
  label: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 sm:justify-end">
        {links.map((link) => {
          const here = isHere(pathname, link.href, links);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={here ? "page" : undefined}
                className={
                  here
                    ? "text-[0.9375rem] font-semibold underline decoration-2 underline-offset-[6px]"
                    : "text-[0.9375rem] font-semibold text-muted-foreground hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * The dashboard is the exception: everything lives under it, so matching by
 * prefix would leave it underlined on every page of the area.
 */
function isHere(
  pathname: string,
  href: string,
  links: ReadonlyArray<{ href: string }>,
): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  // A longer link that also matches is the more specific one, and wins.
  return !links.some((other) => other.href.length > href.length && pathname.startsWith(other.href));
}
