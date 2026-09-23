import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CalendarSubscribe } from "@/components/learner/calendar-subscribe";
import { JoinButton } from "@/components/learner/join";
import { NotYourProgramme } from "@/components/learner/not-yours";
import { ProgrammeSwitcher } from "@/components/learner/switcher";
import { RelativeLabel } from "@/components/live";
import { NoSession, NotYours } from "@/lib/area-api";
import { formatEventWhen } from "@/lib/format";
import {
  chooseEnrollment,
  getEnrollments,
  getLearner,
  getSessions,
  type LearnerSession,
} from "@/lib/learner-api";

export const metadata: Metadata = { title: "Your schedule" };

/**
 * Every session in the run, by week.
 *
 * Cancelled ones stay on the list, marked: a session that vanishes leaves
 * somebody wondering whether they misread the time. Past ones keep their
 * recording link when there is one.
 */
export default async function SchedulePage({ searchParams }: PageProps<"/learn/schedule">) {
  const { run } = await searchParams;

  let learner, enrollments;
  try {
    [learner, enrollments] = await Promise.all([getLearner(), getEnrollments()]);
  } catch (error) {
    if (error instanceof NoSession) redirect("/learn/login");
    throw error;
  }

  const chosen = chooseEnrollment(enrollments ?? [], typeof run === "string" ? run : undefined);
  if (chosen.kind === "not-yours") return <NotYourProgramme />;
  if (chosen.kind === "none") redirect("/learn");
  const enrollment = chosen.enrollment;

  let sessions: LearnerSession[];
  try {
    sessions = await getSessions(enrollment.program.id);
  } catch (error) {
    if (error instanceof NotYours) return <NotYourProgramme />;
    throw error;
  }

  const weeks = [...new Set(sessions.map((session) => session.week))].sort((a, b) => a - b);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display text-[2.5rem] sm:text-5xl">Your schedule</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {enrollment.program.title}
            {enrollment.program.runLabel ? ` · ${enrollment.program.runLabel}` : ""}
          </p>
        </div>
        <ProgrammeSwitcher
          enrollments={enrollments ?? []}
          current={enrollment.program.id}
          basePath="/learn/schedule"
        />
      </div>

      {learner.calendarFeedToken ? (
        <CalendarSubscribe token={learner.calendarFeedToken} className="mt-8" />
      ) : null}

      {sessions.length === 0 ? (
        <p className="mt-10 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
          Nothing is scheduled yet. Every session appears here, and in your calendar, as soon as it
          is set.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {weeks.map((week) => (
            <section key={week} aria-labelledby={`week-${week}`}>
              <h2 id={`week-${week}`} className="text-title text-2xl">
                Week {week}
              </h2>
              <ul className="mt-4 grid gap-px border-2 border-foreground bg-foreground">
                {sessions
                  .filter((session) => session.week === week)
                  .map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: LearnerSession }) {
  const when = formatEventWhen(session.startsAt, session.endsAt);
  const cancelled = session.status === "cancelled";

  return (
    <li className="bg-background p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className={`text-title text-xl ${cancelled ? "line-through decoration-2" : ""}`}>
            {session.title}
          </h3>
          <p className="mt-2 leading-[1.5]">
            {when.date} · {when.time}
          </p>
          {cancelled ? (
            <p className="mt-2 font-semibold">This session was cancelled.</p>
          ) : (
            <RelativeLabel
              startsAt={session.startsAt}
              className="mt-2 block font-semibold text-muted-foreground"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {session.recordingUrl ? (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="self-center font-semibold underline underline-offset-4 hover:no-underline"
            >
              Watch the recording
            </a>
          ) : null}
          {session.joinUrl && !cancelled ? (
            <JoinButton
              joinUrl={session.joinUrl}
              startsAt={session.startsAt}
              endsAt={session.endsAt}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}

