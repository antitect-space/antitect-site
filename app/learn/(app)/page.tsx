import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CutFrame } from "@/components/cut";
import { JoinButton } from "@/components/learner/join";
import { NotYourProgramme } from "@/components/learner/not-yours";
import { StateChip } from "@/components/learner/project-pieces";
import { ProgrammeSwitcher } from "@/components/learner/switcher";
import { RelativeLabel } from "@/components/live";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { NoSession, NotYours } from "@/lib/area-api";
import { formatDay, formatEventWhen } from "@/lib/format";
import {
  chooseEnrollment,
  getEnrollments,
  getLearner,
  getProgramOverview,
  type Learner,
  type LearnerEnrollment,
  type ProgramOverview,
} from "@/lib/learner-api";
import { PROJECT_STATE } from "@/lib/projects";

export const metadata: Metadata = { title: "Your programme" };

/**
 * The dashboard, whose whole job is one question: what do I do next?
 *
 * So it leads with the next session and the project in hand, and everything
 * else — progress, the last piece of feedback, the booking link — comes after.
 * Anything the API returns as null is left out rather than filled in: a
 * programme with nothing scheduled yet should look like one.
 */
export default async function LearnerHomePage({ searchParams }: PageProps<"/learn">) {
  const { run } = await searchParams;

  let learner: Learner;
  let enrollments: LearnerEnrollment[] | null;
  try {
    [learner, enrollments] = await Promise.all([getLearner(), getEnrollments()]);
  } catch (error) {
    if (error instanceof NoSession) redirect("/learn/login");
    throw error;
  }

  const greeting = (
    <h1 className="text-display text-[2.5rem] sm:text-5xl">Welcome, {learner.firstName}.</h1>
  );

  if (enrollments === null) {
    return (
      <div className="container-page py-10 sm:py-14">
        {greeting}
        <p className="mt-8 max-w-[52ch] text-lg leading-[1.6]">
          Your account is ready. Your programme, schedule and projects appear here as soon as they
          are set up.
        </p>
      </div>
    );
  }

  const chosen = chooseEnrollment(enrollments, typeof run === "string" ? run : undefined);
  if (chosen.kind === "not-yours") return <NotYourProgramme />;
  if (chosen.kind === "none") {
    return (
      <div className="container-page py-10 sm:py-14">
        {greeting}
        <div className="mt-8 max-w-[52ch]">
          <p className="text-lg leading-[1.6]">
            You are signed in, but not on a programme yet. When you enrol, everything you need
            appears here.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/programmes">See the programmes</Link>
          </Button>
        </div>
      </div>
    );
  }
  const enrollment = chosen.enrollment;

  let overview: ProgramOverview;
  try {
    overview = await getProgramOverview(enrollment.program.id);
  } catch (error) {
    // Signed in, but this run is not theirs — a real answer, not a fault.
    if (error instanceof NotYours) return <NotYourProgramme />;
    throw error;
  }

  const { program, nextSession, currentProject, progress, latestFeedback } = overview;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {greeting}
          <p className="mt-3 text-lg text-muted-foreground">
            {program.title}
            {program.runLabel ? ` · ${program.runLabel}` : ""}
          </p>
        </div>
        <ProgrammeSwitcher enrollments={enrollments} current={enrollment.program.id} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* What is happening next, and the way into it. */}
        <CutFrame corner="tr" tone="ink" innerClassName="p-6 sm:p-8">
          <h2 className="text-[0.9375rem] font-semibold text-background/70">Next session</h2>
          {nextSession ? (
            <NextSession session={nextSession} />
          ) : (
            <p className="mt-4 leading-[1.6] text-background/80">
              Nothing scheduled yet. It appears here, and in your calendar, as soon as it is set.
            </p>
          )}
        </CutFrame>

        {/* What they are meant to be building. */}
        <CutFrame corner="bl" innerClassName="p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[0.9375rem] font-semibold text-muted-foreground">Your project</h2>
            <p className="text-[0.9375rem] font-semibold tabular-nums">
              {progress.approved} of {progress.total} approved
            </p>
          </div>

          {currentProject ? (
            <>
              <h3 className="text-title mt-4 text-2xl">
                <Link
                  href={`/learn/projects/${currentProject.id}`}
                  className="hover:underline hover:underline-offset-4"
                >
                  {currentProject.title}
                </Link>
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StateChip state={currentProject.state} />
                {currentProject.deadlineAt ? (
                  <span className="text-[0.9375rem] text-muted-foreground">
                    Due {formatDay(currentProject.deadlineAt)}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 leading-[1.5] text-muted-foreground">
                {PROJECT_STATE[currentProject.state].meaning}
              </p>
              <Button asChild className="mt-6">
                <Link href={`/learn/projects/${currentProject.id}`}>Open the brief</Link>
              </Button>
            </>
          ) : (
            <p className="mt-4 leading-[1.6] text-muted-foreground">
              No project is open yet. They appear here as the programme opens them.
            </p>
          )}
        </CutFrame>
      </div>

      {latestFeedback ? (
        <section aria-labelledby="feedback-title" className="mt-10">
          <h2 id="feedback-title" className="text-title text-2xl">
            The last thing your tutor said
          </h2>
          <div className="mt-4 border-l-2 border-foreground pl-5">
            <p className="text-[0.9375rem] font-semibold text-muted-foreground">
              {latestFeedback.projectTitle} · version {latestFeedback.version} ·{" "}
              {formatDay(latestFeedback.reviewedAt)}
            </p>
            {latestFeedback.feedback ? (
              <div className="mt-3">
                <Markdown>{latestFeedback.feedback}</Markdown>
              </div>
            ) : null}
            <Button asChild variant="outline" className="mt-5">
              <Link href={`/learn/projects/${latestFeedback.projectId}`}>Open that project</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="next-title" className="mt-12 border-t-2 border-foreground pt-8">
        <h2 id="next-title" className="text-title text-2xl">
          Everything else
        </h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/learn/schedule?run=${program.id}`}>See the whole schedule</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/learn/projects?run=${program.id}`}>All projects</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/learn/reviews?run=${program.id}`}>Book your Project Review Session</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function NextSession({ session }: { session: NonNullable<ProgramOverview["nextSession"]> }) {
  const when = formatEventWhen(session.startsAt, session.endsAt);

  return (
    <>
      <p className="text-[0.8125rem] font-semibold text-background/60">Week {session.week}</p>
      <h3 className="text-title mt-2 text-2xl sm:text-3xl">{session.title}</h3>
      <p className="mt-4 text-lg leading-[1.4] font-semibold">
        {when.date}
        <br />
        {when.time}
      </p>
      <RelativeLabel
        startsAt={session.startsAt}
        className="mt-2 block font-semibold text-background/75"
      />

      {session.joinUrl && session.status !== "cancelled" ? (
        <JoinButton
          joinUrl={session.joinUrl}
          startsAt={session.startsAt}
          endsAt={session.endsAt}
          tone="ink"
          className="mt-6"
        />
      ) : null}
      {session.status === "cancelled" ? (
        <p className="mt-4 font-semibold text-background/80">This session has been cancelled.</p>
      ) : null}
    </>
  );
}
