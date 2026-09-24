import Link from "next/link";

import { Logo } from "@/components/logo";
import { CONTACT, NAV } from "@/lib/site";

/**
 * The address, the phone number and the WhatsApp link are among the strongest
 * legitimacy signals in this market, so they are prominent, on every page.
 */
export function Footer() {
  const linkClass = "underline-offset-4 hover:underline";

  return (
    <footer className="border-t border-border">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:py-16">
        <div>
          {/* Mono: the page has already spent its red. */}
          <Logo mono />
          <p className="mt-5 max-w-[36ch] text-lg leading-[1.5]">Practical AI capability, built across Africa.</p>
          <p className="mt-2 text-muted-foreground">Learn by building.</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-semibold">Explore</h2>
          <ul className="mt-4 space-y-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#faq" className={linkClass}>
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/community" className={linkClass}>
                Join the community
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-semibold">Contact</h2>
          <address className="mt-4 space-y-3 not-italic">
            <p>
              <a href={`mailto:${CONTACT.email}`} className={linkClass}>
                {CONTACT.email}
              </a>
            </p>
            <p>
              <a href={CONTACT.phoneHref} className={linkClass}>
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={CONTACT.whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 hover:no-underline">
                WhatsApp us
              </a>
            </p>
            <p className="leading-[1.5] text-muted-foreground">{CONTACT.address.display}</p>
          </address>
        </div>
      </div>
      <div className="container-page">
        <p className="border-t border-border py-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Antitect</p>
      </div>
    </footer>
  );
}
