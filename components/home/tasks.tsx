import Link from "next/link";

import { FollowupsCard, LeadsCard, PaymentsCard, VideoCard } from "@/components/handover/cards";
import { ArrowRight } from "@/components/icons";
import { followups, leads, payments, tasksSection, video, type Task } from "@/content/handover";
import type { PublicProgram } from "@/lib/api";

const TASKS = [
  { task: leads.task, Card: LeadsCard },
  { task: followups.task, Card: FollowupsCard },
  { task: payments.task, Card: PaymentsCard },
  { task: video.task, Card: VideoCard },
] as const;

/**
 * "What you'll be able to do" (Home B, section 2): four real tasks, each with
 * a small handover card and the programme that teaches it (design section 13).
 */
export function TasksSection({ programs }: { programs: readonly PublicProgram[] }) {
  return (
    <section aria-labelledby="tasks-title" className="section-pad">
      <div className="container-site">
        <div className="grid gap-3 lg:grid-cols-[662fr_466fr] lg:items-start lg:gap-6">
          <h2 id="tasks-title" className="type-h2 text-ink lg:pt-3">
            {tasksSection.title}
          </h2>
          <p className="type-lead text-ink-muted">{tasksSection.intro}</p>
        </div>

        <div className="mt-10 grid gap-12 lg:mt-16 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-16">
          {TASKS.map(({ task, Card }) => (
            <TaskBlock key={task.title} task={task} link={programmeLink(task, programs)}>
              <Card />
            </TaskBlock>
          ))}
        </div>
      </div>
    </section>
  );
}

function TaskBlock({ task, link, children }: { task: Task; link: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="type-h3 text-ink">{task.title}</h3>
        <p className="type-meta font-medium text-ink-muted">{task.who}</p>
      </div>
      <div className="flex flex-1 flex-col [&>figure]:flex-1">{children}</div>
      <Link
        href={link.href}
        className="inline-flex min-h-11 items-center gap-2 self-start text-base leading-none font-semibold text-ink underline-offset-4 hover:underline"
      >
        {link.label}
        <ArrowRight />
      </Link>
    </div>
  );
}

/**
 * The programme that teaches a task. Each cohort is its own record with its
 * own address, so the link is found by the programme's title among the runs
 * the CRM is offering now, and says the title the CRM holds. With no such
 * run, it leads to the programmes list instead.
 */
function programmeLink(task: Task, programs: readonly PublicProgram[]): { href: string; label: string } {
  const wanted = task.taughtIn.trim().toLowerCase();
  const run = programs.find((program) => program.title.trim().toLowerCase() === wanted);
  return run
    ? { href: `/programmes/${run.slug}`, label: `Taught in ${run.title}` }
    : { href: "/programmes", label: "Taught in a capability development programme" };
}
