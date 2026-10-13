import Link from "next/link";

import { Depth } from "@/components/home/depth";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Format } from "@/content/formats";

/**
 * "Go further than a webinar." (design, webinars and workshops pages): the
 * deeper formats as cards beside the heading, each its depth, name, promise
 * and facts, with a text link. No live part and no button: the page's red
 * button is the next session's.
 */
export function GoFurther({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<{ format: Format; link: { label: string; href: string } }>;
}) {
  return (
    <section aria-labelledby="go-further-title" className="section-pad">
      <div className="container-site grid gap-8 lg:grid-cols-[368fr_760fr] lg:gap-6">
        <h2 id="go-further-title" className="type-h2 text-ink">
          {title}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {items.map(({ format, link }) => (
            <article
              key={format.title}
              className="flex flex-col justify-between gap-6 rounded-md border border-field-border bg-paper p-6"
            >
              <div className="flex flex-col gap-4">
                <Depth level={format.depth} time={format.time} />
                <div className="flex flex-col gap-1.5">
                  <h3 className="type-h3 text-ink">{format.title}</h3>
                  <p className="text-[1.3125rem] leading-[1.35] text-ink">{format.promise}</p>
                </div>
                <p className="type-small font-medium text-ink">{format.facts}</p>
              </div>
              <Button asChild variant="text" className="self-start">
                <Link href={link.href}>
                  {link.label}
                  <ArrowRight />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
