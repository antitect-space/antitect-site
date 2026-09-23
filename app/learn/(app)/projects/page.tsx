import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotYourProgramme } from "@/components/learner/not-yours";
import { ProjectRow } from "@/components/learner/project-pieces";
import { ProgrammeSwitcher } from "@/components/learner/switcher";
import { NoSession, NotYours } from "@/lib/area-api";
import { chooseEnrollment, getEnrollments, getProjects, type ProjectSummary } from "@/lib/learner-api";

export const metadata: Metadata = { title: "Your projects" };

/**
 * All six, in order, whatever state they are in.
 *
 * Locked projects are listed in full. The live sessions run ahead of the work,
 * so somebody following along needs to read what is coming; what a lock closes
 * is submission, not the brief.
 */
export default async function ProjectsPage({ searchParams }: PageProps<"/learn/projects">) {
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

  let projects: ProjectSummary[];
  try {
    projects = await getProjects(enrollment.program.id);
  } catch (error) {
    if (error instanceof NotYours) return <NotYourProgramme />;
    throw error;
  }

  const approved = projects.filter((project) => project.state === "approved").length;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display text-[2.5rem] sm:text-5xl">Your projects</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {projects.length > 0
              ? `${approved} of ${projects.length} approved. You progress by finishing them, not by attending.`
              : enrollment.program.title}
          </p>
        </div>
        <ProgrammeSwitcher
          enrollments={enrollments ?? []}
          current={enrollment.program.id}
          basePath="/learn/projects"
        />
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
          The projects for this run are not set up yet. They appear here, with their briefs, as soon
          as they are.
        </p>
      ) : (
        <ul className="mt-10 grid gap-px border-2 border-foreground bg-foreground">
          {[...projects]
            .sort((a, b) => a.order - b.order)
            .map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                href={`/learn/projects/${project.id}?run=${enrollment.program.id}`}
              />
            ))}
        </ul>
      )}
    </div>
  );
}
