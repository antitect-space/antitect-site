import Link from "next/link";

import { Lockup } from "@/components/logo";
import { COMPANY, CONTACT, FOOTER_NAV } from "@/lib/site";

/**
 * The footer (design section 12): on paper, with a hairline above. The only
 * place the home city appears. On a phone every link is a 44px row.
 *
 * The desktop grid keeps the design's four columns, so the brand and the
 * groups sit where they were drawn while Legal waits for its pages.
 */
export function Footer() {
  const [learn, ...others] = FOOTER_NAV;

  return (
    <footer className="border-t border-rule bg-paper">
      <div className="container-site flex flex-col gap-10 pt-12 pb-8 lg:gap-12 lg:pt-16 lg:pb-10">
        <div className="grid gap-10 lg:grid-cols-[466fr_270fr_172fr_172fr] lg:gap-6">
          <div className="flex flex-col gap-4">
            <Lockup />
            <div className="type-small flex flex-col gap-1 text-ink-muted">
              <p>Antitect teaches people to use AI on their real work.</p>
              <p>Based in {CONTACT.address.display}.</p>
            </div>
          </div>

          {learn ? <FooterGroup heading={learn.heading} links={learn.links} /> : null}

          <div className="grid grid-cols-2 gap-5 lg:contents">
            {others.map((group) => (
              <FooterGroup key={group.heading} heading={group.heading} links={group.links} />
            ))}
          </div>
        </div>

        <div className="type-small flex flex-col gap-2 border-t border-rule pt-6 text-ink-muted lg:flex-row lg:items-center lg:gap-3">
          <p>© {new Date().getFullYear()} Antitect</p>
          {COMPANY.cacNumber ? (
            <>
              <span aria-hidden="true" className="max-lg:hidden">
                ·
              </span>
              <p>RC {COMPANY.cacNumber}</p>
            </>
          ) : null}
          {COMPANY.socials.length > 0 ? (
            <>
              <span aria-hidden="true" className="max-lg:hidden">
                ·
              </span>
              <ul className="flex flex-wrap gap-x-4">
                {COMPANY.socials.map((social) => (
                  <li key={social.href}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ heading, links }: { heading: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return (
    <nav aria-label={heading} className="flex flex-col lg:gap-3">
      <h2 className="type-meta font-medium text-ink-muted">{heading}</h2>
      <ul className="flex flex-col lg:gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex min-h-11 items-center text-base leading-[1.2] text-ink underline-offset-4 hover:underline lg:type-small lg:min-h-0"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
