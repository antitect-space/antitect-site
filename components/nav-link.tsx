"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A header link that knows when it is the page you are on: Webinars on
 * /webinars and on every webinar's page (design W9). It says so with
 * aria-current, which the header styles as the design's 2px ink underline.
 * The path is known when the page is rendered, so the mark is in the HTML.
 */
export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={className}>
      {children}
    </Link>
  );
}
