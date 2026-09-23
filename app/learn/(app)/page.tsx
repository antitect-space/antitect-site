import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CutFrame } from "@/components/cut";
import { Button } from "@/components/ui/button";
import { NoSession } from "@/lib/area-api";
import { formatDay } from "@/lib/format";
import { getEnrollments, getLearner, type LearnerEnrollment } from "@/lib/learner-api";

export const metadata: Metadata = { title: "Your programme" };

/**
 * The dashboard, as far as it goes today: who you are, and what you are on.
 *
 * Its real job — what do I do next — needs sessions and projects, which the
 * API does not serve yet. Until it does, this says what it knows and no more.
 * A dashboard that invented a schedule would be worse than an empty one.
 */
export default async function LearnerHomePage() {
  let learner, enrollments;
  try {
    [learner, enrollments] = await Promise.all([getLearner(), getEnrollments()]);
  } catch (error) {
    // The cookie is gone or the API rejected it. Nothing to show but the way back in.
    if (error instanceof NoSession) redirect("/learn/login");
    throw error;
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">Welcome, {learner.firstName}.</h1>

      {enrollments === null ? (
        <BeingSetUp />
      ) : enrollments.length === 0 ? (
        <NotEnrolled />
      ) : (
        <ul className="mt-10 grid gap-6">
          {enrollments.map((enrollment) => (
            <li key={enrollment.id}>
              <Enrolment enrollment={enrollment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Enrolment({ enrollment }: { enrollment: LearnerEnrollment }) {
  const { program, progress } = enrollment;

  return (
    <CutFrame corner="tr" innerClassName="p-6 sm:p-8">
      <p className="text-[0.9375rem] font-semibold text-muted-foreground">
        Capability Development Programme
        {program.runLabel ? ` · ${program.runLabel}` : ""}
      </p>
      <h2 className="text-title mt-3 text-2xl sm:text-3xl">{program.title}</h2>

      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <dt className="text-[0.8125rem] font-semibold text-muted-foreground">
            {program.phase === "enrolling" ? "Starts" : "Started"}
          </dt>
          <dd className="mt-1 font-semibold">
            {program.startsAt ? formatDay(program.startsAt) : "To be confirmed"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.8125rem] font-semibold text-muted-foreground">Projects approved</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {progress.approved} of {progress.total}
          </dd>
        </div>
      </dl>

      <p className="mt-6 max-w-[52ch] leading-[1.6] text-muted-foreground">
        Your schedule, briefs and project reviews appear here as the programme opens them.
      </p>
    </CutFrame>
  );
}

/**
 * The API cannot answer what this learner is on yet, which is true while the
 * programme endpoints are still being built. Saying so is better than an error
 * page, and much better than implying they are on nothing.
 */
function BeingSetUp() {
  return (
    <div className="mt-8 max-w-[52ch]">
      <p className="text-lg leading-[1.6]">
        Your account is ready. Your programme, schedule and projects appear here as soon as they are
        set up.
      </p>
    </div>
  );
}

function NotEnrolled() {
  return (
    <div className="mt-8 max-w-[52ch]">
      <p className="text-lg leading-[1.6]">
        You are signed in, but not on a programme yet. When you enrol, everything you need appears
        here.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link href="/programmes">See the programmes</Link>
      </Button>
    </div>
  );
}
