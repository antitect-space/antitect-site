import type { ProjectRow } from "@/lib/programs";

/**
 * A programme's projects (design C5): a large number in Newsreader, the title
 * and one line of what gets built, between hairlines. "Week 1" and "What
 * you'll gain" appear only when the CRM has them.
 */
export function ProjectList({ projects }: { projects: readonly ProjectRow[] }) {
  return (
    <ol className="border-t border-rule">
      {projects.map((project) => (
        <li key={project.key} className="flex gap-4 border-b border-rule py-6">
          <span aria-hidden="true" className="type-h2 w-12 shrink-0 text-ink-muted tabular-nums lg:w-16">
            {String(project.number).padStart(2, "0")}
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            {project.week !== null ? (
              <p className="type-meta font-medium text-ink-muted tabular-nums">Week {project.week}</p>
            ) : null}
            <h3 className="type-h3 text-ink">{project.title}</h3>
            {project.build ? <p className="type-body text-ink-muted">{project.build}</p> : null}
            {project.gain ? (
              <p className="type-small pt-1 text-ink">
                <span className="font-semibold">What you’ll gain:</span> {project.gain}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
