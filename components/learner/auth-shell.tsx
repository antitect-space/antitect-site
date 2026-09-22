import Link from "next/link";

import { CutFrame } from "@/components/cut";
import { Logo } from "@/components/logo";
import { CONTACT } from "@/lib/site";

/**
 * Every page somebody sees before they are signed in: one column, one panel,
 * one thing to do. It keeps the site's geometry so the learner area does not
 * read as a different product, and drops everything else — there is no nav
 * worth showing to somebody who cannot get past this page.
 */
export function AuthShell({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-page flex flex-1 flex-col items-center py-10 sm:py-16">
      <div className="w-full max-w-[26rem]">
        <Link href="/" className="inline-flex" aria-label="Antitect home">
          <Logo />
        </Link>

        <h1 className="text-display mt-8 text-[2rem] sm:text-4xl">{title}</h1>
        {lead ? <p className="mt-3 leading-[1.5] text-muted-foreground">{lead}</p> : null}

        <CutFrame corner="bl" className="mt-8" innerClassName="p-6 sm:p-7">
          {children}
        </CutFrame>

        {footer ? <div className="mt-6 text-[0.9375rem] leading-[1.5]">{footer}</div> : null}

        <p className="mt-10 text-[0.9375rem] leading-[1.5] text-muted-foreground">
          Stuck?{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline underline-offset-4 hover:no-underline">
            {CONTACT.email}
          </a>
        </p>
      </div>
    </div>
  );
}
