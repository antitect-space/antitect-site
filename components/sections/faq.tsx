import type { FaqItem } from "@/content/faq";
import { cn } from "@/lib/utils";

/** Native disclosure elements: they open before any JavaScript arrives, and work if none does. */
export function FaqSection({
  items,
  title = "Questions people ask",
  id = "faq",
  className,
}: {
  items: readonly FaqItem[];
  title?: string;
  id?: string;
  /** For `notch-clearance` where a notched section follows. */
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-4 border-b", className)}>
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:py-24">
        <h2 id={`${id}-title`} className="text-display text-4xl sm:text-5xl">
          {title}
        </h2>
        <div className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-lg leading-[1.4] font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="mt-0.5 text-2xl leading-none font-normal">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 leading-[1.6] text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
