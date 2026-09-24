import type { ProjectRow, ScheduleRow } from "@/lib/programs";

/**
 * The run's weekly pattern: which days, what time, and what each session is
 * for. Times are Lagos wall-clock and say so once, at the foot, rather than on
 * every line.
 */
export function WeeklySchedule({ rows }: { rows: ScheduleRow[] }) {
  return (
    <div>
      <ul className="grid gap-px border-2 border-foreground bg-foreground">
        {rows.map((row) => (
          <li
            key={row.key}
            className="grid gap-1 bg-background p-4 sm:grid-cols-[9rem_11rem_1fr] sm:items-baseline sm:gap-4"
          >
            <span className="font-semibold">{row.day}</span>
            <span className="tabular-nums">{row.time}</span>
            {row.title ? <span className="text-muted-foreground">{row.title}</span> : <span />}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[0.9375rem] text-muted-foreground">All times are West Africa Time.</p>
    </div>
  );
}

/**
 * The projects, one a week, with what each builds and what it leaves you able
 * to do.
 *
 * A table on a wide screen, because that is how the team reads it and how
 * people compare rows. On a phone four columns would be unreadable, so each
 * project becomes a block with the same labels. Only one of the two is ever
 * displayed; the other is `display: none`, so a screen reader meets one.
 *
 * A column appears only when some project has something for it: a run whose
 * record has no weeks set shows no empty Week column.
 */
export function ProjectsTable({ rows }: { rows: ProjectRow[] }) {
  const hasBuild = rows.some((row) => row.build);
  const hasGain = rows.some((row) => row.gain);
  const hasWeek = rows.some((row) => row.week !== null);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse border-2 border-foreground text-left">
          <thead>
            <tr className="bg-foreground text-background">
              <th scope="col" className="p-3 text-[0.9375rem] font-semibold">
                Project
              </th>
              {hasBuild ? (
                <th scope="col" className="p-3 text-[0.9375rem] font-semibold">
                  What you&apos;ll build
                </th>
              ) : null}
              {hasGain ? (
                <th scope="col" className="p-3 text-[0.9375rem] font-semibold">
                  What you&apos;ll gain
                </th>
              ) : null}
              {hasWeek ? (
                <th scope="col" className="p-3 text-[0.9375rem] font-semibold">
                  Week
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-border align-top">
                <th scope="row" className="p-3 font-semibold">
                  <span className="block text-[0.8125rem] tabular-nums text-muted-foreground">
                    {String(row.number).padStart(2, "0")}
                  </span>
                  {row.title}
                </th>
                {hasBuild ? (
                  <td className="p-3 leading-[1.5] whitespace-pre-line text-muted-foreground">{row.build}</td>
                ) : null}
                {hasGain ? (
                  <td className="p-3 leading-[1.5] whitespace-pre-line text-muted-foreground">{row.gain}</td>
                ) : null}
                {hasWeek ? <td className="p-3 tabular-nums">{row.week ?? ""}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol className="grid gap-px border-2 border-foreground bg-foreground md:hidden">
        {rows.map((row) => (
          <li key={row.key} className="bg-background p-5">
            <p className="text-[0.8125rem] font-semibold tabular-nums text-muted-foreground">
              Project {String(row.number).padStart(2, "0")}
              {row.week !== null ? ` · Week ${row.week}` : ""}
            </p>
            <h3 className="text-title mt-2 text-xl">{row.title}</h3>
            {row.build ? (
              <>
                <p className="mt-3 text-[0.8125rem] font-semibold">What you&apos;ll build</p>
                <p className="mt-1 leading-[1.5] whitespace-pre-line text-muted-foreground">{row.build}</p>
              </>
            ) : null}
            {row.gain ? (
              <>
                <p className="mt-3 text-[0.8125rem] font-semibold">What you&apos;ll gain</p>
                <p className="mt-1 leading-[1.5] whitespace-pre-line text-muted-foreground">{row.gain}</p>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
