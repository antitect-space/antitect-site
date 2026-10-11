import { Minus, Plus } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import type { FaqItem } from "@/content/faq";
import { cn } from "@/lib/utils";

/**
 * Questions (design section 09), as native disclosure elements: they open
 * before any JavaScript arrives, and work if none does. The whole summary row
 * is the target, at least 56px tall, with a plus that turns to a minus.
 */
export function FaqSection({
  items,
  title = "Questions people ask.",
  id = "faq",
  openFirst = false,
  className,
}: {
  items: readonly FaqItem[];
  title?: string;
  id?: string;
  /** The home page opens its first answer, as the design shows it. */
  openFirst?: boolean;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("section-pad scroll-mt-4", className)}>
      <div className="container-site grid gap-8 lg:grid-cols-[368fr_760fr] lg:gap-6">
        <h2 id={`${id}-title`} className="type-h2 text-ink">
          {title}
        </h2>
        <div>
          {items.map((item, index) => (
            <details key={item.question} open={openFirst && index === 0} className="group border-b border-rule">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 text-lg leading-[1.4] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <Plus className="group-open:hidden" />
                <Minus className="hidden group-open:block" />
              </summary>
              {item.markdown ? (
                <div className="type-body pb-6 text-ink-muted lg:pr-[220px]">
                  <Markdown>{item.answer}</Markdown>
                </div>
              ) : (
                <p className="type-body pb-6 text-ink-muted lg:pr-[220px]">{item.answer}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
