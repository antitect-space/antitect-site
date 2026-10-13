import Link from "next/link";

import { RecordingThumbnail } from "@/components/recording/thumbnail";
import type { PublicEvent } from "@/lib/api";
import { eventHref } from "@/lib/events";
import { formatDay } from "@/lib/format";
import type { Recording } from "@/lib/recordings";

/**
 * A past webinar with a recording (design W2): one link, to the webinar's
 * page, which shows the recording once it is over. The title stops at two
 * lines and underlines on hover.
 */
export function RecordingCard({
  event,
  recording,
  sizes = "(min-width: 1024px) 368px, 100vw",
  as: Heading = "h3",
}: {
  event: Pick<PublicEvent, "slug" | "type" | "title" | "startsAt">;
  recording: Recording;
  sizes?: string;
  as?: "h3" | "h4";
}) {
  return (
    <Link href={eventHref(event)} className="group flex flex-col gap-4">
      <RecordingThumbnail src={recording.thumbnailUrl} sizes={sizes} />
      <span className="flex flex-col gap-1.5">
        <Heading className="type-h3 line-clamp-2 text-ink underline-offset-4 group-hover:underline">
          {event.title}
        </Heading>
        <span className="type-meta font-medium text-ink-muted tabular-nums">
          Recorded <time dateTime={event.startsAt}>{formatDay(event.startsAt)}</time>
        </span>
      </span>
    </Link>
  );
}
