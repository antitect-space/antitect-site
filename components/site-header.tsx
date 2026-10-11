import Link from "next/link";

import { ArrowRight, Close, Menu } from "@/components/icons";
import { Lockup } from "@/components/logo";
import { MenuCloser } from "@/components/menu-closer";
import { Button } from "@/components/ui/button";
import { CONTACT_LINK, JOIN_FREE, NAV, SIGN_IN } from "@/lib/site";

const MENU_ID = "site-menu";

/**
 * The header (design section 11). It scrolls away with the page. "Join free"
 * is ink, not red: the hero's red button shares the first screen with it.
 *
 * The full navigation needs about 1,100px, so below `xl` the header is the
 * phone one: the lockup, "Join free" and a native <details> menu, which opens
 * before any JavaScript arrives. The menu button reaches 10px into the right
 * margin, so its icon lines up with the content edge while the target stays
 * 44px.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b border-rule bg-paper">
      <div className="container-site flex h-17 items-center justify-between gap-4 max-xl:pr-[calc(var(--page-margin)-10px)] xl:h-22">
        <Link href="/" aria-label="Antitect home" className="-my-2 py-2">
          <Lockup />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 xl:flex">
          {NAV.map((item) => (
            <HeaderLink key={item.label} href={item.href}>
              {item.label}
            </HeaderLink>
          ))}
          <span aria-hidden="true" className="h-5 w-px bg-field-border" />
          <HeaderLink href={SIGN_IN.href}>{SIGN_IN.label}</HeaderLink>
          <Button asChild variant="secondary" className="px-4">
            <Link href={JOIN_FREE.href}>{JOIN_FREE.label}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1 xl:hidden">
          <Button asChild variant="secondary" className="px-3.5">
            <Link href={JOIN_FREE.href}>{JOIN_FREE.label}</Link>
          </Button>
          <details id={MENU_ID} className="group">
            <summary
              aria-label="Menu"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-ink [&::-webkit-details-marker]:hidden"
            >
              <Menu className="group-open:hidden" />
              <Close className="hidden group-open:block" />
            </summary>
            <nav aria-label="Main" className="absolute inset-x-0 top-full z-40 border-b border-rule bg-paper">
              <ul className="container-site pt-2 pb-6">
                {[...NAV, CONTACT_LINK, SIGN_IN].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-14 items-center justify-between gap-4 border-b border-rule text-lg leading-[1.2] font-medium text-ink"
                    >
                      {item.label}
                      <ArrowRight />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
          <MenuCloser menuId={MENU_ID} />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-11 items-center text-base leading-none font-medium text-ink underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
