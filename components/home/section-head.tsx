/**
 * A home page section's head: the heading on the left, a sentence of intro on
 * the right (stacked on a phone). From `xl` the heading keeps to one line, as
 * the design draws it, and the intro takes what is left; below that it wraps
 * into balanced lines.
 */
export function SectionHead({ id, title, intro }: { id: string; title: string; intro: string }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[662fr_466fr] lg:items-start lg:gap-6 xl:grid-cols-[auto_minmax(0,1fr)]">
      <h2 id={id} className="type-h2 text-ink lg:pt-3 xl:whitespace-nowrap">
        {title}
      </h2>
      <p className="type-lead text-ink-muted">{intro}</p>
    </div>
  );
}
