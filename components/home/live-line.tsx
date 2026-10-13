import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { Fresh } from "@/components/live";
import { liveLineFallback } from "@/content/home";
import type { PublicEvent } from "@/lib/api";
import { eventHref, isPaid } from "@/lib/events";
import { formatDayShort } from "@/lib/format";

/**
 * The line under the header (design B1): one real, current fact from the CRM
 * in place of a rating badge, and the whole chip is the link. With a webinar
 * scheduled it leads to its registration; with none, to the community.
 *
 * `Fresh` is the guard against a page that has sat in a cache: once the
 * browser knows the time, a webinar that has started stops being offered.
 */
export function LiveLine({ webinar }: { webinar: PublicEvent | null }) {
  const fallback = (
    <Chip href={liveLineFallback.href}>
      <span className="text-balance">{liveLineFallback.label}</span>
    </Chip>
  );

  if (!webinar) return fallback;

  const kind = isPaid(webinar) ? "Next webinar" : "Next free webinar";

  return (
    <Fresh startsAt={webinar.startsAt} endsAt={webinar.endsAt} fallback={fallback}>
      <Chip href={eventHref(webinar)}>
        <span>
          {kind} ·{" "}
          <time dateTime={webinar.startsAt} className="tabular-nums">
            {formatDayShort(webinar.startsAt)}
          </time>
          <span className="max-lg:hidden"> ·</span>
        </span>
        <span className="font-semibold max-lg:hidden">Register</span>
      </Chip>
    </Fresh>
  );
}

function Chip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="type-small inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-field-border bg-paper px-4 py-2.5 text-left leading-[1.4] font-medium text-ink hover:bg-wash"
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-ink" />
      {children}
      <ArrowRight />
    </Link>
  );
}
