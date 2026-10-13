import { RecordingCard } from "@/components/recording/recording-card";
import { ArrowDown } from "@/components/icons";
import type { PublicEvent } from "@/lib/api";
import type { Recording } from "@/lib/recordings";

type Item = { event: PublicEvent; recording: Recording };

/**
 * Past webinars with recordings (design, "Watch a past webinar"): three
 * across on a desktop, stacked on a phone. On a phone only the first three
 * show; "Show more" is a native disclosure that reveals the rest below it, so
 * it needs no script. It stays where it is, and keeps focus, as "Show fewer".
 */
export function RecordingGrid({ items, more }: { items: readonly Item[]; more: string }) {
  const first = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div className="flex flex-col gap-10 lg:gap-12">
      <ul className="grid gap-10 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
        {first.map((item) => (
          <li key={item.event.slug}>
            <RecordingCard event={item.event} recording={item.recording} />
          </li>
        ))}
        {/* On a desktop the rest simply follow; on a phone they wait behind "Show more". */}
        {rest.map((item) => (
          <li key={item.event.slug} className="max-lg:hidden">
            <RecordingCard event={item.event} recording={item.recording} />
          </li>
        ))}
      </ul>

      {rest.length > 0 ? (
        <details className="group lg:hidden">
          <summary className="flex h-11 w-fit cursor-pointer list-none items-center gap-2 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{more}</span>
            <span className="hidden group-open:inline">Show fewer</span>
            <ArrowDown className="group-open:rotate-180" />
          </summary>
          <ul className="mt-10 grid gap-10">
            {rest.map((item) => (
              <li key={item.event.slug}>
                <RecordingCard event={item.event} recording={item.recording} />
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
