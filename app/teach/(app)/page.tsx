import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { QueueRow } from "@/components/tutor/queue-row";
import { Button } from "@/components/ui/button";
import { NoSession } from "@/lib/area-api";
import { getQueue, getTutor, getTutorPrograms, type Queue } from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Your runs" };

/**
 * The tutor's dashboard, whose one question is: what needs me now?
 *
 * The answer is nearly always the queue, so the queue is the page — oldest
 * first, because the person who has waited longest is the one being let down.
 */
export default async function TutorHomePage() {
  let tutor, queue: Queue, programs;
  try {
    [tutor, queue, programs] = await Promise.all([getTutor(), getQueue(), getTutorPrograms()]);
  } catch (error) {
    if (error instanceof NoSession) redirect("/teach/login");
    throw error;
  }

  const waiting = queue.total;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">Welcome, {tutor.firstName}.</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {waiting === 0
          ? "Nothing is waiting on you."
          : `${waiting} ${waiting === 1 ? "piece" : "pieces"} of work waiting, oldest first.`}
      </p>

      {waiting > 0 ? (
        <>
          <ul className="mt-10 grid gap-px border-2 border-foreground bg-foreground">
            {queue.items.slice(0, 5).map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </ul>
          {waiting > 5 ? (
            <Button asChild variant="outline" className="mt-6">
              <Link href="/teach/review">See all {waiting}</Link>
            </Button>
          ) : null}
        </>
      ) : (
        <p className="mt-8 max-w-[52ch] text-lg leading-[1.6]">
          When somebody sends work in, it appears here and you will get an email about it.
        </p>
      )}

      {programs.length > 0 ? (
        <section aria-labelledby="runs-title" className="mt-14 border-t-2 border-foreground pt-8">
          <h2 id="runs-title" className="text-title text-2xl">
            What you teach
          </h2>
          <ul className="mt-5 space-y-2">
            {programs.map((program) => (
              <li key={program.id} className="text-lg">
                {program.title}
                {program.runLabel ? (
                  <span className="text-muted-foreground"> · {program.runLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
