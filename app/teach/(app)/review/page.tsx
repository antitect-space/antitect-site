import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { QueueRow } from "@/components/tutor/queue-row";
import { NoSession, NotYours } from "@/lib/area-api";
import { getQueue, type Queue } from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Review queue" };

/**
 * Everything waiting, across every run this tutor teaches, oldest first.
 *
 * Filtering by run is the API's job, and it checks rather than trusts: asking
 * for a run they do not teach is a refusal, not an empty list.
 */
export default async function ReviewQueuePage({ searchParams }: PageProps<"/teach/review">) {
  const { run } = await searchParams;

  let queue: Queue;
  try {
    queue = await getQueue(typeof run === "string" ? run : undefined);
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

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">Review queue</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        {queue.total === 0
          ? "Nothing is waiting on you."
          : `${queue.total} waiting. The one at the top has waited longest.`}
        {queue.total > queue.items.length
          ? ` These are the oldest ${queue.items.length}; the rest appear as these are cleared.`
          : ""}
      </p>

      {queue.items.length > 0 ? (
        <ul className="mt-10 grid gap-px border-2 border-foreground bg-foreground">
          {queue.items.map((item) => (
            <QueueRow key={item.id} item={item} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
