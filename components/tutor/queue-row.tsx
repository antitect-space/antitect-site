import Link from "next/link";

import { RelativeLabel } from "@/components/live";
import { formatDay } from "@/lib/format";
import type { QueueItem } from "@/lib/tutor-api";

/**
 * One piece of work waiting. Everything needed to decide whether to open it
 * now: who, which project, how long it has been sitting, and whether it came
 * in late.
 */
export function QueueRow({ item }: { item: QueueItem }) {
  return (
    <li className="bg-background p-5 transition-colors duration-200 hover:bg-muted motion-reduce:transition-none sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div>
          <p className="text-[0.8125rem] font-semibold text-muted-foreground">
            {item.program.title}
            {item.program.runLabel ? ` · ${item.program.runLabel}` : ""} · Project{" "}
            {String(item.project.order).padStart(2, "0")}
          </p>
          <h3 className="text-title mt-2 text-xl sm:text-2xl">
            <Link
              href={`/teach/review/${item.id}`}
              className="hover:underline hover:underline-offset-4"
            >
              {item.learner.name} · {item.project.title}
            </Link>
          </h3>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            Version {item.version} · sent {formatDay(item.submittedAt)}
            {item.isLate ? " · late" : ""}
            {item.reviewStartedAt ? " · already opened" : ""}
          </p>
          <RelativeLabel
            startsAt={item.submittedAt}
            className="mt-1 block text-[0.9375rem] font-semibold"
          />
        </div>

        <Link
          href={`/teach/review/${item.id}`}
          className="shrink-0 self-center border-2 border-foreground px-4 py-2 font-semibold hover:bg-foreground hover:text-background"
        >
          Review
          <span className="sr-only">
            {" "}
            {item.learner.name}&apos;s {item.project.title}
          </span>
        </Link>
      </div>
    </li>
  );
}
