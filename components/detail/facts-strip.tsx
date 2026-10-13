/**
 * A detail page's facts (design C3): a label above each value, hairlines
 * between them. Five across on a desktop, two columns on a phone. A fact the
 * CRM has no figure for is left out, and the rest close up. Values never
 * break inside; should five long ones not fit the column, the row wraps.
 */
export function FactsStrip({ facts }: { facts: ReadonlyArray<{ label: string; value: string | null }> }) {
  const shown = facts.filter((fact): fact is { label: string; value: string } => Boolean(fact.value));
  if (shown.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 border-t border-rule lg:flex lg:flex-wrap lg:gap-y-3 lg:border-b lg:py-4">
      {shown.map((fact) => (
        <div
          key={fact.label}
          className="flex flex-col gap-1 border-b border-rule py-3.5 max-lg:odd:pr-4 max-lg:even:border-l max-lg:even:pl-4 lg:border-b-0 lg:border-l lg:px-3 lg:py-0 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
        >
          <dt className="type-meta font-medium text-ink-muted">{fact.label}</dt>
          <dd className="type-body font-semibold whitespace-nowrap text-ink tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
