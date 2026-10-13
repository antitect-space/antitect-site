import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * "Your next step" (design W9): a compact block under a hairline, a sentence
 * and two text links to the deeper formats. No button: the page's one red
 * button is the panel's.
 */
export function NextStep({
  text,
  links,
}: {
  text: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <section aria-labelledby="next-step-title" className="flex flex-col gap-2 border-t border-rule pt-6">
      <h2 id="next-step-title" className="type-meta font-medium text-ink-muted">
        Your next step
      </h2>
      <p className="type-body text-ink">{text}</p>
      <div className="flex flex-wrap gap-x-6">
        {links.map((link) => (
          <Button key={link.href} asChild variant="text">
            <Link href={link.href}>
              {link.label}
              <ArrowRight />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
