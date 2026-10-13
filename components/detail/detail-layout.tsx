import { cn } from "@/lib/utils";

/**
 * A webinar, workshop or programme page (design "Webinar · Open", "Workshop ·
 * Open", "Programme · Enrolling"): the page's head and its sections in seven
 * columns, the panel in five. "recording" gives the recording page its eight
 * and four.
 *
 * On a desktop the panel starts level with the H1, below the back link, and
 * keeps 32px from the top of the window as the page scrolls. It sticks only
 * within its own column, which ends where the sections end, so it never
 * rides over the close band below, and only in a window tall enough to show
 * all of it: on a short laptop screen a stuck panel would hide its own button.
 *
 * On a phone the panel comes straight after the head, 32px down, and the
 * sections follow 64px further on; on a desktop they are 80 apart.
 */
export function DetailLayout({
  head,
  panel,
  children,
  split = "panel",
  className,
}: {
  head: React.ReactNode;
  panel: React.ReactNode;
  children: React.ReactNode;
  split?: "panel" | "recording";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "container-site grid gap-y-8 pt-2 pb-16 lg:gap-x-6 lg:gap-y-0 lg:pt-6 lg:pb-28",
        split === "recording" ? "lg:grid-cols-[760fr_368fr]" : "lg:grid-cols-[662fr_466fr]",
        className,
      )}
    >
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">{head}</div>
      <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-[4.25rem]">
        <div className="lg:top-8 lg:[@media(min-height:56rem)]:sticky">{panel}</div>
      </aside>
      <div
        className={cn(
          "mt-8 flex min-w-0 flex-col gap-16 lg:col-start-1 lg:row-start-2",
          split === "recording" ? "lg:mt-16 lg:gap-16" : "lg:mt-20 lg:gap-20",
        )}
      >
        {children}
      </div>
    </div>
  );
}
