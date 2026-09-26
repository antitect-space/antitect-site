import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/site";

/**
 * The destinations, and the way in for learners. Sign in is outlined, not
 * filled: it is for the few with an account, and the hero's "Join the
 * community" stays the loudest thing for everyone else. Somebody already
 * signed in is sent on to their dashboard by the proxy.
 *
 * On a phone the menu is a native <details>, so it opens before any
 * JavaScript arrives, and the sign-in button stays outside it.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b border-border">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link href="/" aria-label="Antitect home" className="-m-2 p-2">
          <Logo wordmarkClassName="max-[479px]:sr-only" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-[0.9375rem] font-medium md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline hover:underline-offset-4">
              {item.label}
            </Link>
          ))}
          <Button asChild variant="outline">
            <Link href="/learn/login">Sign in</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Button asChild variant="outline" className="h-11 px-4 text-[0.9375rem]">
            <Link href="/learn/login">Sign in</Link>
          </Button>
          <details className="group">
            <summary
              aria-label="Menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md border border-foreground [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span className="absolute inset-x-0 top-0 h-0.5 bg-foreground group-open:top-[5px] group-open:rotate-45" />
                <span className="absolute inset-x-0 top-[5px] h-0.5 bg-foreground group-open:opacity-0" />
                <span className="absolute inset-x-0 top-[10px] h-0.5 bg-foreground group-open:top-[5px] group-open:-rotate-45" />
              </span>
            </summary>
            <nav
              aria-label="Main"
              className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background shadow-[0_12px_24px_-12px_rgb(0_0_0/0.25)]"
            >
              <ul className="container-page divide-y divide-border py-2">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="flex min-h-12 items-center text-lg font-semibold">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
