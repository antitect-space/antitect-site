import Link from "next/link";

import { Markdown } from "@/components/markdown";
import { formatDay } from "@/lib/format";
import type { ProjectState, ProjectSummary, Resource, Submission } from "@/lib/learner-api";
import { PROJECT_STATE } from "@/lib/projects";
import { cn } from "@/lib/utils";

/** The state, said once, in a shape that reads at a glance down a list. */
export function StateChip({ state, className }: { state: ProjectState; className?: string }) {
  const { label, tone } = PROJECT_STATE[state];

  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 text-[0.8125rem] font-semibold",
        tone === "done" && "bg-foreground text-background",
        tone === "open" && "bg-brand text-brand-foreground",
        tone === "waiting" && "border-2 border-border text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function ProjectRow({ project, href }: { project: ProjectSummary; href: string }) {
  const { meaning } = PROJECT_STATE[project.state];

  return (
    <li className="group bg-background p-5 transition-colors duration-200 hover:bg-muted motion-reduce:transition-none sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold tabular-nums text-muted-foreground">
          Project {String(project.order).padStart(2, "0")} · Week {project.week}
        </p>
        <StateChip state={project.state} />
      </div>

      <h3 className="text-title mt-3 text-xl sm:text-2xl">
        <Link href={href} className="hover:underline hover:underline-offset-4">
          {project.title}
        </Link>
      </h3>

      {project.whatYoullBuild ? (
        <p className="mt-2 max-w-[62ch] leading-[1.5] text-muted-foreground">{project.whatYoullBuild}</p>
      ) : null}

      <p className="mt-3 text-[0.9375rem] text-muted-foreground">
        {meaning}
        {project.deadlineAt ? ` Due ${formatDay(project.deadlineAt)}.` : ""}
      </p>
    </li>
  );
}

/**
 * A resource, or the promise of one.
 *
 * Before its release date the API sends the title and no link, and this shows
 * exactly that. Asking again will not produce a link, so the page does not
 * pretend it might.
 */
export function ResourceLink({ resource }: { resource: Resource }) {
  if (!resource.available || !resource.url) {
    return (
      <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
        <span className="text-muted-foreground">{resource.title}</span>
        <span className="text-[0.9375rem] text-muted-foreground">
          {resource.releaseAt ? `Opens ${formatDay(resource.releaseAt)}` : "Not available yet"}
        </span>
      </li>
    );
  }

  return (
    <li className="py-3">
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline underline-offset-4 hover:no-underline"
      >
        {resource.title}
      </a>
      <span className="ml-2 text-[0.9375rem] text-muted-foreground">{resource.type}</span>
    </li>
  );
}

/** One attempt: what was sent, when, and what came back. */
export function SubmissionEntry({ submission }: { submission: Submission }) {
  return (
    <li className="border-t-2 border-border pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-title text-lg">Version {submission.version}</h3>
        <p className="text-[0.9375rem] text-muted-foreground">
          Sent {formatDay(submission.submittedAt)}
          {submission.isLate ? " · late" : ""}
        </p>
      </div>

      {submission.links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
          {submission.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.9375rem] font-semibold underline underline-offset-4 hover:no-underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {submission.notes ? (
        <p className="mt-3 leading-[1.5] whitespace-pre-line text-muted-foreground">{submission.notes}</p>
      ) : null}

      {submission.feedback ? (
        <div className="mt-4 border-l-2 border-foreground pl-4">
          <p className="text-[0.8125rem] font-semibold text-muted-foreground">
            Your tutor{submission.reviewedAt ? `, ${formatDay(submission.reviewedAt)}` : ""}
          </p>
          <div className="mt-2">
            <Markdown>{submission.feedback}</Markdown>
          </div>
        </div>
      ) : null}
    </li>
  );
}
