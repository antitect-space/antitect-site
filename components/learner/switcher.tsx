import Link from "next/link";

import type { LearnerEnrollment } from "@/lib/learner-api";

/**
 * For anybody on more than one run. Everyone else never sees it, because a
 * chooser with one choice is just furniture.
 *
 * Plain links rather than a menu: there are two or three of these at most, and
 * a link that works without JavaScript beats a dropdown that does not.
 */
export function ProgrammeSwitcher({
  enrollments,
  current,
  basePath = "/learn",
}: {
  enrollments: readonly LearnerEnrollment[];
  current: string;
  basePath?: string;
}) {
  if (enrollments.length < 2) return null;

  return (
    <nav aria-label="Your programmes" className="flex flex-wrap gap-2">
      {enrollments.map(({ id, program }) => {
        const here = program.id === current;
        return (
          <Link
            key={id}
            href={`${basePath}?run=${program.id}`}
            aria-current={here ? "page" : undefined}
            className={`border-2 px-3 py-1.5 text-[0.9375rem] font-semibold ${
              here
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground"
            }`}
          >
            {program.runLabel ? `${program.title} · ${program.runLabel}` : program.title}
          </Link>
        );
      })}
    </nav>
  );
}
