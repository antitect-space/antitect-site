import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotYourProgramme } from "@/components/learner/not-yours";
import { BookedReview, SlotPicker } from "@/components/learner/review-booking";
import { ProgrammeSwitcher } from "@/components/learner/switcher";
import { NoSession, NotYours } from "@/lib/area-api";
import { formatDateRange, hasEnded, lagosToday } from "@/lib/format";
import {
  chooseEnrollment,
  getEnrollments,
  getReviewSessions,
  type ReviewSessions,
  type ReviewWeek,
} from "@/lib/learner-api";

export const metadata: Metadata = { title: "Project Review Sessions" };

/**
 * Booking a Project Review Session: one a week, with the tutor, to go through
 * the project in hand.
 *
 * Each week of the run is shown with either its booking or the times still
 * open in it. Every rule — how long a session is, how many a week, how much
 * notice — comes back from the API with the list, so none of it is written
 * here, and the API holds the line on all of it however requests race.
 */
export default async function ReviewsPage({ searchParams }: PageProps<"/learn/reviews">) {
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
  const { program } = chosen.enrollment;

  let reviews: ReviewSessions;
  try {
    reviews = await getReviewSessions(program.id);
  } catch (error) {
    if (error instanceof NotYours) return <NotYourProgramme />;
    throw error;
  }

  // /learn is never cached, so the server's "today" is the visitor's today.
  const today = lagosToday();
  const who = reviews.tutorName ?? "your tutor";

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-display text-[2.5rem] sm:text-5xl">Project Review Sessions</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {program.title}
            {program.runLabel ? ` · ${program.runLabel}` : ""}
          </p>
        </div>
        <ProgrammeSwitcher
          enrollments={enrollments ?? []}
          current={program.id}
          basePath="/learn/reviews"
        />
      </div>

      {reviews.enabled !== false ? (
        <p className="mt-6 max-w-[60ch] text-lg leading-[1.6]">
          {reviews.perWeek === 1
            ? `One ${reviews.minutes}-minute session a week with ${who}`
            : `Up to ${reviews.perWeek} ${reviews.minutes}-minute sessions a week with ${who}`}
          , to go through the project you are working on. Book at least {reviews.minNoticeHours}{" "}
          {reviews.minNoticeHours === 1 ? "hour" : "hours"} ahead; you can cancel up to{" "}
          {reviews.cancelCutoffHours} hours before.
        </p>
      ) : null}

      {reviews.enabled === false ? (
        <p className="mt-10 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
          This programme has no Project Review Sessions.
        </p>
      ) : reviews.weeks.length === 0 ? (
        <p className="mt-10 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
          Times appear here once the programme has its dates.
        </p>
      ) : (
        <ol className="mt-10 grid gap-px border-2 border-foreground bg-foreground">
          {reviews.weeks.map((week) => (
            <WeekRow
              key={week.week}
              week={week}
              reviews={reviews}
              programId={program.id}
              today={today}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function WeekRow({
  week,
  reviews,
  programId,
  today,
}: {
  week: ReviewWeek;
  reviews: ReviewSessions;
  programId: string;
  today: string;
}) {
  const past = week.endsOn < today;
  const current = week.startsOn <= today && today <= week.endsOn;
  const slots = reviews.slots.filter((slot) => slot.week === week.week);

  return (
    <li
      aria-current={current ? "date" : undefined}
      className={`min-w-0 p-5 sm:p-6 ${past ? "bg-muted" : "bg-background"}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-title text-xl">
          Week {week.week}
          {current ? <span className="ml-2 text-[0.9375rem] text-brand">This week</span> : null}
        </h2>
        <p className="text-[0.9375rem] text-muted-foreground">
          {formatDateRange(week.startsOn, week.endsOn)}
        </p>
      </div>

      <div className="mt-4">
        {week.booking && week.booking.status === "booked" ? (
          <BookedReview
            booking={week.booking}
            ended={hasEnded(week.booking.endsAt)}
            cancelCutoffHours={reviews.cancelCutoffHours}
            tutorName={reviews.tutorName}
          />
        ) : past ? (
          <p className="text-muted-foreground">No session this week.</p>
        ) : slots.length > 0 ? (
          <SlotPicker programId={programId} slots={slots} />
        ) : (
          <p className="text-muted-foreground">
            Nothing open this week yet. {reviews.tutorName ?? "Your tutor"} adds times here, so check
            back.
          </p>
        )}
      </div>
    </li>
  );
}
