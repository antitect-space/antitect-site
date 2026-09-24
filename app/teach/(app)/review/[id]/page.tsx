import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Markdown } from "@/components/markdown";
import { ReviewPanel } from "@/components/tutor/review-panel";
import { ApiError } from "@/lib/api";
import { NoSession, NotYours } from "@/lib/area-api";
import { formatDay } from "@/lib/format";
import {
  earlierVersions,
  getReview,
  isOpen,
  type EarlierVersion,
  type ReviewDetail,
} from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Review" };

/**
 * The review screen: the work on one side, the standard it is being read
 * against on the other, and two buttons.
 *
 * The brief sits beside the submission rather than a click away, because
 * judging work against a standard you have to remember is how a cohort ends up
 * with six different standards.
 */
export default async function ReviewPage({ params }: PageProps<"/teach/review/[id]">) {
  const { id } = await params;

  let detail: ReviewDetail;
  try {
    detail = await getReview(id);
  } catch (error) {
    if (error instanceof NoSession) redirect("/teach/login");
    if (error instanceof NotYours) {
      return (
        <div className="container-page py-10 sm:py-14">
          <h1 className="text-display text-[2.5rem] sm:text-5xl">This is not one of your runs.</h1>
          <p className="mt-6 text-lg leading-[1.6] text-muted-foreground">
            You can only review work from a programme you teach.
          </p>
        </div>
      );
    }
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { submission } = detail;
  const { project } = submission;
  const history = earlierVersions(detail);

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1fr] lg:gap-14">
      <div className="lg:col-start-1">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">
          <Link href="/teach/review" className="hover:underline">
            Review queue
          </Link>{" "}
          · {submission.program.title}
          {submission.program.runLabel ? ` · ${submission.program.runLabel}` : ""}
        </p>
        <h1 className="text-display mt-3 text-[2.25rem] sm:text-4xl">
          {submission.learner.name}
        </h1>
        <p className="mt-2 text-lg">
          Project {String(project.order).padStart(2, "0")} · {project.title}
        </p>
        <p className="mt-1 text-[0.9375rem] text-muted-foreground">
          Version {submission.version} · sent {formatDay(submission.submittedAt)}
          {submission.isLate ? " · late" : ""}
        </p>

        <section aria-labelledby="work-title" className="mt-8 border-t-2 border-foreground pt-6">
          <h2 id="work-title" className="text-title text-2xl">
            The work
          </h2>
          {submission.links.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {submission.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold underline underline-offset-4 hover:no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-muted-foreground">No links came with this.</p>
          )}

          {submission.notes ? (
            <>
              <h3 className="text-title mt-6 text-lg">What they said about it</h3>
              <p className="mt-2 leading-[1.6] whitespace-pre-line text-muted-foreground">
                {submission.notes}
              </p>
            </>
          ) : null}
        </section>

        {/* The email links straight here, and a link can outlive the decision:
            somebody else may have got to it first. Decided work is shown as
            decided, never offered for deciding again. */}
        <div className="mt-8">
          {isOpen(submission.status) ? (
            <ReviewPanel
              submissionId={submission.id}
              learnerName={submission.learner.name}
              projectTitle={project.title}
            />
          ) : (
            <section role="status" className="border-2 border-foreground p-6">
              <h2 className="text-title text-2xl">
                {submission.status === "approved" ? "Approved." : "Changes asked for."}
              </h2>
              <p className="mt-2 text-[0.9375rem] text-muted-foreground">
                {submission.reviewedAt ? `Decided ${formatDay(submission.reviewedAt)}.` : "Decided."}
                {submission.status === "revision_required"
                  ? ` A new version from ${submission.learner.name} will arrive in the queue on its own.`
                  : ""}
              </p>
              {submission.feedback ? (
                <div className="mt-4 border-l-2 border-foreground pl-4">
                  <Markdown>{submission.feedback}</Markdown>
                </div>
              ) : null}
            </section>
          )}
        </div>

        {history.length > 0 ? (
          <section aria-labelledby="history-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="history-title" className="text-title text-2xl">
              What came before
            </h2>
            <ul className="mt-6 space-y-6">
              {history.map((version) => (
                <Version key={version.id} version={version} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {/* The standard, beside the work rather than a click away. */}
      <aside className="lg:col-start-2">
        <div className="lg:sticky lg:top-8">
          <h2 className="text-title text-2xl">What this had to do</h2>
          {project.requirements ? (
            <div className="mt-4">
              <Markdown>{project.requirements}</Markdown>
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">
              This project has no requirements written down. They live in the CRM.
            </p>
          )}

          {project.brief ? (
            <details className="mt-8 border-t-2 border-border pt-5">
              <summary className="cursor-pointer text-title text-xl">The full brief</summary>
              <div className="mt-4">
                <Markdown>{project.brief}</Markdown>
              </div>
            </details>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Version({ version }: { version: EarlierVersion }) {
  return (
    <li className="border-t-2 border-border pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-title text-lg">Version {version.version}</h3>
        <p className="text-[0.9375rem] text-muted-foreground">
          {formatDay(version.submittedAt)}
        </p>
      </div>

      {version.feedback ? (
        <div className="mt-3 border-l-2 border-foreground pl-4">
          <p className="text-[0.8125rem] font-semibold text-muted-foreground">
            You said{version.reviewedAt ? `, ${formatDay(version.reviewedAt)}` : ""}
          </p>
          <div className="mt-2">
            <Markdown>{version.feedback}</Markdown>
          </div>
        </div>
      ) : null}
    </li>
  );
}
