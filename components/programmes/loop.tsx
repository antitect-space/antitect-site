import { loop } from "@/content/loop";

/**
 * The programme loop (design C4). Programme pages only.
 *
 * Full: five steps in a row on a desktop, each a number, a name and one line,
 * joined by a 1px ink rail with small arrows, and a return line running back
 * from Apply to Learn. On a phone the steps stack with the rail down the
 * left, and the return is said in words. The rail is drawing; the list is an
 * ordered list, so the order is read without it.
 *
 * `review` is the run's own review cadence, from the CRM ("A 30-minute
 * Project Review Session each week"); without it the step says nothing about
 * how often.
 */
export function Loop({ review }: { review?: string | null }) {
  const steps = loop.steps.map((step) => (step.name === "Review" && review ? { ...step, line: review } : step));

  return (
    <div className="relative lg:pb-10">
      <ol className="flex flex-col lg:grid lg:grid-cols-5">
        {steps.map((step, index) => {
          const number = String(index + 1).padStart(2, "0");
          const last = index === steps.length - 1;
          return (
            <li key={step.name} className="grid grid-cols-[20px_minmax(0,1fr)] gap-4 lg:flex lg:flex-col lg:pr-6">
              {/* Phone: the number, then the rail down to the next step. */}
              <span aria-hidden="true" className="flex flex-col items-center gap-1.5 pt-0.5 lg:hidden">
                <span className="type-meta font-semibold text-ink tabular-nums">{number}</span>
                <span className="w-px flex-1 bg-ink" />
                <Arrowhead direction="down" />
              </span>
              {/* Desktop: the number, then the rail across to the next step. */}
              <span aria-hidden="true" className="flex items-center gap-2 max-lg:hidden">
                <span className="type-meta font-semibold text-ink tabular-nums">{number}</span>
                <span className="h-px flex-1 bg-ink" />
                {last ? null : <Arrowhead direction="right" />}
              </span>
              <span className="flex flex-col gap-1 pb-6 lg:gap-1.5 lg:pb-0">
                <span className="type-h3 text-ink">{step.name}</span>
                <span className="type-body text-ink-muted">{step.line}</span>
              </span>
            </li>
          );
        })}
      </ol>

      {/* Desktop: from Apply's rail, round under the steps and back up to Learn. */}
      <span aria-hidden="true" className="max-lg:hidden">
        <span className="absolute top-[9px] right-0 h-px w-6 bg-ink" />
        <span className="absolute top-[9px] right-0 bottom-0 left-[6px] border-r border-b border-ink" />
        <span className="absolute bottom-0 left-[6px] h-[15px] w-px bg-ink" />
        <span className="absolute bottom-[14px] left-[2px]">
          <Arrowhead direction="up" />
        </span>
      </span>

      <p className="type-meta flex items-center gap-3 pt-1 font-semibold text-ink lg:sr-only">
        <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5 fill-none stroke-ink stroke-[1.5]">
          <path d="M7 13V1.5M2.5 6 7 1.5 11.5 6" />
        </svg>
        {loop.back}
      </p>
    </div>
  );
}

/** The five names on one line, with arrows between: where a page only mentions the loop. */
export function LoopCompact() {
  return (
    <ol aria-label="How each project runs" className="type-body flex flex-wrap items-center gap-x-1 gap-y-1 font-semibold text-ink">
      {loop.steps.map((step, index) => (
        <li key={step.name} className="flex items-center gap-1">
          {index > 0 ? (
            <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5 fill-none stroke-ink stroke-[1.5]">
              <path d="M1 5h7.5M5.5 2 8.5 5l-3 3" />
            </svg>
          ) : null}
          {step.name}
        </li>
      ))}
    </ol>
  );
}

function Arrowhead({ direction }: { direction: "right" | "down" | "up" }) {
  const path = { right: "M0 0l5 4-5 4", down: "M0 0l4 5 4-5", up: "M0 5l4-5 4 5" }[direction];
  const box = direction === "right" ? "0 0 5 8" : "0 0 8 5";
  return (
    <svg
      viewBox={box}
      className={(direction === "right" ? "h-2 w-[5px]" : "h-[5px] w-2") + " shrink-0 overflow-visible fill-none stroke-ink stroke-[1.5]"}
    >
      <path d={path} />
    </svg>
  );
}
