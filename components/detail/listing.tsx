import { RingEcho } from "@/components/detail/ring-echo";
import { CommunityForm } from "@/components/forms/community-form";

/**
 * The parts the webinars and workshops pages share (design "Webinars" and
 * "Workshops"): the page's header, and the box that takes the next session's
 * place when nothing is scheduled.
 */

export function ListingHeader({
  title,
  lead,
  facts,
  rings = false,
}: {
  title: string;
  lead: string;
  facts: string;
  /** The webinars page echoes Home B's rings behind its header; desktop only. */
  rings?: boolean;
}) {
  return (
    <header className="relative overflow-hidden">
      {rings ? <RingEcho /> : null}
      <div className="container-site relative flex flex-col gap-5 pt-12 pb-10 lg:gap-6 lg:pt-24 lg:pb-18">
        <h1 className="type-h1 text-ink">{title}</h1>
        <div className="flex max-w-[564px] flex-col gap-3 lg:gap-4">
          <p className="type-lead text-ink-muted">{lead}</p>
          <p className="type-meta font-medium text-ink-muted">{facts}</p>
        </div>
      </div>
    </header>
  );
}

/** With nothing scheduled: the community form, so the page still offers a next step. */
export function NothingScheduled({ title, line }: { title: string; line: string }) {
  return (
    <section aria-labelledby="nothing-title" className="container-site pb-16 lg:pb-28">
      <div className="grid gap-6 rounded-md border border-field-border bg-paper p-6 lg:grid-cols-[minmax(0,426px)_minmax(0,524px)] lg:justify-between lg:p-10">
        <div className="flex flex-col gap-4">
          <h2 id="nothing-title" className="type-h2 text-ink">
            {title}
          </h2>
          <p className="type-lead text-ink-muted">{line}</p>
        </div>
        <CommunityForm idPrefix="nothing-community" variant="inline" />
      </div>
    </section>
  );
}
