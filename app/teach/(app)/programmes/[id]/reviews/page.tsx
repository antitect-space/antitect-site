import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OpenWindowForm, WindowCard } from "@/components/tutor/review-windows";
import { NoSession, NotYours } from "@/lib/area-api";
import {
  getTutorPrograms,
  getTutorReviews,
  splitWindows,
  type TutorProgramSummary,
  type TutorReviews,
} from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Project Review Sessions" };

/**
 * A tutor's Project Review Sessions for one run: open time, see who took
 * which slot, close what nobody has booked, cancel a booking with a reason.
 *
 * Every limit — the session length, one a week, the notice learners need —
 * comes back from the API, so this page states them rather than knowing them.
 */
export default async function TutorReviewsPage({
  params,
}: PageProps<"/teach/programmes/[id]/reviews">) {
  const { id } = await params;

  let programs: TutorProgramSummary[];
  let reviews: TutorReviews;
  try {
    [programs, reviews] = await Promise.all([getTutorPrograms(), getTutorReviews(id)]);
  } catch (error) {
    if (error instanceof NoSession) redirect("/teach/login");
    if (error instanceof NotYours) {
      return (
        <div className="container-page py-10 sm:py-14">
          <h1 className="text-display text-[2.5rem] sm:text-5xl">You do not teach this run.</h1>
        </div>
      );
    }
    throw error;
  }

  const program = programs.find((p) => p.id === id);
  const { upcoming, earlier } = splitWindows(reviews.windows);

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="text-[0.9375rem] font-semibold text-muted-foreground">
        <Link href="/teach" className="hover:underline">
          Your runs
        </Link>
        {program ? ` · ${program.title}${program.runLabel ? ` · ${program.runLabel}` : ""}` : ""}
      </p>
      <h1 className="text-display mt-3 text-[2.5rem] sm:text-5xl">Project Review Sessions</h1>
      <p className="mt-4 max-w-[62ch] text-lg leading-[1.6] text-muted-foreground">
        Open blocks of time and learners book {reviews.minutes}-minute slots from them,{" "}
        {reviews.perWeek === 1 ? "one a week each" : `up to ${reviews.perWeek} a week each`}. They
        need to book at least {reviews.minNoticeHours}{" "}
        {reviews.minNoticeHours === 1 ? "hour" : "hours"} ahead, and can cancel up to{" "}
        {reviews.cancelCutoffHours} hours before. Every booking lands in your calendar.
      </p>

      <section aria-labelledby="open-title" className="mt-10 border-t-2 border-foreground pt-6">
        <h2 id="open-title" className="text-title text-2xl">
          Open some time
        </h2>
        <div className="mt-5 max-w-[46rem]">
          <OpenWindowForm programId={id} minutes={reviews.minutes} />
        </div>
      </section>

      <section aria-labelledby="windows-title" className="mt-12 border-t-2 border-foreground pt-6">
        <h2 id="windows-title" className="text-title text-2xl">
          Coming up
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-lg leading-[1.6] text-muted-foreground">
            Nothing open. Learners see times here as soon as you open some.
          </p>
        ) : (
          <ul className="mt-5 grid gap-px border-2 border-foreground bg-foreground">
            {upcoming.map((window) => (
              <WindowCard key={window.id} window={window} past={false} />
            ))}
          </ul>
        )}
      </section>

      {earlier.length > 0 ? (
        <details className="mt-12 border-t-2 border-foreground pt-6">
          <summary className="text-title cursor-pointer text-2xl">
            Earlier ({earlier.length})
          </summary>
          <ul className="mt-5 grid gap-px border-2 border-foreground bg-foreground">
            {earlier.map((window) => (
              <WindowCard key={window.id} window={window} past />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
