import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NoSession, NotYours } from "@/lib/area-api";
import { formatDay } from "@/lib/format";
import { getReviewed, type QueueItem } from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Reviewed work" };

/**
 * Everything already decided, by learner.
 *
 * The queue is for what is waiting; once decided, work leaves it. But there
 * are reasons to go back — a learner asks what was wrong with version one, a
 * new version needs reading against the old feedback, a cohort's progress
 * needs a look before a session — and each of them starts from a person, not
 * from a date. So this is grouped by learner, each with their work in project
 * order.
 */
export default async function ReviewedPage({ searchParams }: PageProps<"/teach/reviewed">) {
  const { run } = await searchParams;

  let items: QueueItem[];
  try {
    items = await getReviewed(typeof run === "string" ? run : undefined);
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

  const learners = byLearner(items);
  // Only worth naming the run on each line when there is more than one.
  const manyRuns = new Set(items.map((item) => item.program.id)).size > 1;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">Reviewed work</h1>
      <p className="mt-3 max-w-[60ch] text-lg leading-[1.5] text-muted-foreground">
        {learners.length === 0
          ? "Nothing has been decided yet. Work you approve or send back appears here."
          : `Everything you have decided, for ${learners.length} ${
              learners.length === 1 ? "learner" : "learners"
            }. Open any piece to see what they sent and what you said.`}
      </p>

      {learners.length > 0 ? (
        <nav aria-label="Learners" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {learners.map((learner) => (
              <li key={learner.key}>
                <a
                  href={`#${learner.anchor}`}
                  className="inline-block border-2 border-border px-3 py-1.5 text-[0.9375rem] font-semibold hover:border-foreground"
                >
                  {learner.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="mt-12 space-y-14">
        {learners.map((learner) => (
          <section
            key={learner.key}
            id={learner.anchor}
            aria-labelledby={`${learner.anchor}-name`}
            className="scroll-mt-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-foreground pb-3">
              <h2 id={`${learner.anchor}-name`} className="text-title text-2xl">
                {learner.name}
              </h2>
              <p className="text-[0.9375rem] text-muted-foreground">{tally(learner.items)}</p>
            </div>
            {learner.email ? (
              <p className="mt-2 text-[0.9375rem] text-muted-foreground">{learner.email}</p>
            ) : null}

            <ul className="mt-5 grid gap-px border-2 border-foreground bg-foreground">
              {learner.items.map((item) => (
                <ReviewedRow key={item.id} item={item} showRun={manyRuns} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ReviewedRow({ item, showRun }: { item: QueueItem; showRun: boolean }) {
  const approved = item.status === "approved";

  return (
    <li className="bg-background p-5 transition-colors duration-200 hover:bg-muted motion-reduce:transition-none sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-[0.8125rem] font-semibold text-muted-foreground">
            Project {String(item.project.order).padStart(2, "0")} · Version {item.version}
            {showRun
              ? ` · ${item.program.title}${item.program.runLabel ? ` ${item.program.runLabel}` : ""}`
              : ""}
          </p>
          <h3 className="text-title mt-2 text-xl">
            <Link href={`/teach/review/${item.id}`} className="hover:underline hover:underline-offset-4">
              {item.project.title}
            </Link>
          </h3>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem] text-muted-foreground">
            <span
              className={
                approved
                  ? "bg-foreground px-2 py-0.5 text-[0.8125rem] font-semibold text-background"
                  : "border-2 border-foreground px-2 py-0.5 text-[0.8125rem] font-semibold text-foreground"
              }
            >
              {approved ? "Approved" : "Changes asked for"}
            </span>
            <span>
              {item.reviewedAt ? `Decided ${formatDay(item.reviewedAt)}` : "Decided"}
              {item.isLate ? " · came in late" : ""}
            </span>
          </p>
        </div>

        <Link
          href={`/teach/review/${item.id}`}
          className="shrink-0 self-center border-2 border-foreground px-4 py-2 font-semibold hover:bg-foreground hover:text-background"
        >
          Open
          <span className="sr-only">
            {" "}
            {item.learner.name}&apos;s {item.project.title}, version {item.version}
          </span>
        </Link>
      </div>
    </li>
  );
}

interface LearnerWork {
  key: string;
  anchor: string;
  name: string;
  email?: string;
  items: QueueItem[];
}

/** One group per learner, alphabetical; their work in project order, then version. */
function byLearner(items: readonly QueueItem[]): LearnerWork[] {
  const groups = new Map<string, LearnerWork>();

  for (const item of items) {
    const key = item.learner.id ?? item.learner.email ?? item.learner.name;
    const group = groups.get(key) ?? {
      key,
      anchor: `learner-${key.replace(/[^\w-]/g, "")}`,
      name: item.learner.name,
      email: item.learner.email,
      items: [],
    };
    group.items.push(item);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => a.project.order - b.project.order || a.version - b.version,
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** "4 approved · 1 sent back". */
function tally(items: readonly QueueItem[]): string {
  const approved = items.filter((item) => item.status === "approved").length;
  const sentBack = items.length - approved;
  return [
    approved > 0 ? `${approved} approved` : null,
    sentBack > 0 ? `${sentBack} sent back` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
