import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CutFrame } from "@/components/cut";
import { NotYourProgramme } from "@/components/learner/not-yours";
import {
  ResourceLink,
  StateChip,
  SubmissionEntry,
} from "@/components/learner/project-pieces";
import { SubmissionForm } from "@/components/learner/submission-form";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { NoSession, NotYours } from "@/lib/area-api";
import { formatDay } from "@/lib/format";
import { chooseEnrollment, getEnrollments, getProject, type ProjectDetail } from "@/lib/learner-api";
import { PROJECT_STATE } from "@/lib/projects";

export const metadata: Metadata = { title: "Project" };

/**
 * One project: what to build, what it must do, what to read, and every
 * attempt so far with what the tutor said about it.
 *
 * There is no submission form here yet — that is the next step, and a form
 * that posted nowhere would be worse than none. Everything a learner needs in
 * order to start is already here.
 */
export default async function ProjectPage({ params, searchParams }: PageProps<"/learn/projects/[id]">) {
  const { id } = await params;
  const { run } = await searchParams;

  let enrollments;
  try {
    enrollments = await getEnrollments();
  } catch (error) {
    if (error instanceof NoSession) redirect("/learn/login");
    throw error;
  }

  const chosen = chooseEnrollment(enrollments ?? [], typeof run === "string" ? run : undefined);
  if (chosen.kind === "not-yours") return <NotYourProgramme />;
  if (chosen.kind === "none") redirect("/learn");
  const enrollment = chosen.enrollment;

  let detail: ProjectDetail;
  try {
    detail = await getProject(enrollment.program.id, id);
  } catch (error) {
    if (error instanceof NotYours) return <NotYourProgramme />;
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { project, resources, submissions } = detail;
  const state = PROJECT_STATE[project.state];
  const locked = project.state === "locked";
  const newestFirst = [...submissions].sort((a, b) => b.version - a.version);
  // The API decides who may send work, per learner. This only renders it.
  const canSubmit = project.state === "in_progress" || project.state === "revision_required";

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <div className="lg:col-start-1">
        <p className="text-[0.9375rem] font-semibold text-muted-foreground">
          <Link href={`/learn/projects?run=${enrollment.program.id}`} className="hover:underline">
            Projects
          </Link>{" "}
          · Project {String(project.order).padStart(2, "0")} · Week {project.week}
        </p>
        <h1 className="text-display mt-3 text-[2.5rem] sm:text-5xl">{project.title}</h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <StateChip state={project.state} />
          {project.deadlineAt ? (
            <span className="text-[0.9375rem] text-muted-foreground">
              Due {formatDay(project.deadlineAt)}
            </span>
          ) : null}
        </div>
        <p className="mt-3 max-w-[52ch] leading-[1.5] text-muted-foreground">{state.meaning}</p>

        {project.whatYoullBuild ? (
          <section aria-labelledby="build-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="build-title" className="text-title text-2xl">
              What you will build
            </h2>
            <p className="mt-3 max-w-[62ch] text-lg leading-[1.6]">{project.whatYoullBuild}</p>
          </section>
        ) : null}

        {project.brief ? (
          <section aria-labelledby="brief-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="brief-title" className="text-title text-2xl">
              The brief
            </h2>
            <div className="mt-4">
              <Markdown>{project.brief}</Markdown>
            </div>
          </section>
        ) : null}

        {project.requirements ? (
          <section aria-labelledby="req-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="req-title" className="text-title text-2xl">
              What it has to do
            </h2>
            <div className="mt-4">
              <Markdown>{project.requirements}</Markdown>
            </div>
          </section>
        ) : null}

        {project.submissionGuidelines ? (
          <section aria-labelledby="how-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="how-title" className="text-title text-2xl">
              How to submit it
            </h2>
            <div className="mt-4">
              <Markdown>{project.submissionGuidelines}</Markdown>
            </div>
          </section>
        ) : null}

        {canSubmit ? (
          <section aria-labelledby="send-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="send-title" className="text-title text-2xl">
              {project.state === "revision_required" ? "Send a new version" : "Send your work in"}
            </h2>
            <p className="mt-3 max-w-[62ch] leading-[1.6] text-muted-foreground">
              Links only — a recording, the thing itself, anything else worth seeing. Once it is
              sent you cannot edit it; if your tutor asks for changes you send a new version.
            </p>
            <div className="mt-6 max-w-[42rem]">
              <SubmissionForm
                programId={enrollment.program.id}
                projectId={project.id}
                deadlineAt={project.deadlineAt}
                isRevision={project.state === "revision_required"}
              />
            </div>
          </section>
        ) : null}

        {submissions.length > 0 ? (
          <section aria-labelledby="history-title" className="mt-10 border-t-2 border-foreground pt-6">
            <h2 id="history-title" className="text-title text-2xl">
              What you have sent
            </h2>
            <ul className="mt-6 space-y-6">
              {newestFirst.map((submission) => (
                <SubmissionEntry key={submission.id} submission={submission} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="space-y-8 lg:col-start-2">
        <CutFrame corner="bl" innerClassName="p-6">
          <h2 className="text-title text-xl">
            {locked ? "Not open yet" : project.state === "approved" ? "Approved" : "Submitting"}
          </h2>
          <p className="mt-3 leading-[1.5] text-muted-foreground">
            {locked
              ? "Read ahead all you like — the sessions run ahead of the work. Submitting opens when the project before this one is approved."
              : project.state === "approved"
                ? "Nothing more to do here. The next project is open."
                : canSubmit
                  ? "Send links to your work below. Your tutor reads it against this brief."
                  : "It is with your tutor. Nothing to do until they come back to you."}
          </p>
          {project.whatYoullGain ? (
            <>
              <h3 className="text-title mt-6 text-lg">What you get out of it</h3>
              <p className="mt-2 leading-[1.5] text-muted-foreground">{project.whatYoullGain}</p>
            </>
          ) : null}
        </CutFrame>

        <section aria-labelledby="resources-title">
          <h2 id="resources-title" className="text-title text-xl">
            Everything for this project
          </h2>
          {resources.length === 0 ? (
            <p className="mt-3 leading-[1.5] text-muted-foreground">
              Nothing here yet. Briefs and templates appear as your tutor adds them.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {resources.map((resource) => (
                <ResourceLink key={resource.id} resource={resource} />
              ))}
            </ul>
          )}
        </section>

        <Button asChild variant="outline" className="w-full">
          <Link href={`/learn/projects?run=${enrollment.program.id}`}>All projects</Link>
        </Button>
      </aside>
    </div>
  );
}
