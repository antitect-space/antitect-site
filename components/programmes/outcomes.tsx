import { Tick } from "@/components/icons";
import type { ScheduleRow } from "@/lib/programs";

/**
 * "What you leave with" (design C1, "Outcome item"): each outcome after a
 * small tick, between hairlines.
 */
export function OutcomeList({ items }: { items: readonly string[] }) {
  return (
    <ul className="border-t border-rule">
      {items.map((item) => (
        <li key={item} className="type-body flex gap-3 border-b border-rule py-3.5 text-ink">
          <span aria-hidden="true" className="flex h-[1.55em] shrink-0 items-center">
            <Tick />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * The weekly timetable (design C1, "Timetable row"), only once the CRM has
 * the days and times: the day, the time in West Africa Time, and what
 * happens, between hairlines.
 */
export function Timetable({ rows }: { rows: readonly ScheduleRow[] }) {
  return (
    <ul className="border-t border-rule">
      {rows.map((row) => (
        <li
          key={row.key}
          className="type-body grid grid-cols-[minmax(0,5rem)_minmax(0,1fr)] gap-x-4 border-b border-rule py-3 tabular-nums sm:grid-cols-[minmax(0,7rem)_auto_minmax(0,1fr)]"
        >
          <span className="font-semibold text-ink">{row.day}</span>
          <span className="text-ink">{row.time} WAT</span>
          {row.title ? <span className="text-ink-muted max-sm:col-start-2">{row.title}</span> : null}
        </li>
      ))}
    </ul>
  );
}
