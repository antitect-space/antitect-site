import type { Metadata } from "next";

import { Panel } from "@/components/detail/panel";
import { CommunityForm } from "@/components/forms/community-form";
import { shareMetadata } from "@/lib/metadata";

const title = "Join the community";
const description =
  "Hear about AI webinars and workshops before they are announced publicly, and build alongside people doing the same. Free to join.";

export const metadata: Metadata = {
  title: { absolute: `${title} — Antitect` },
  ...shareMetadata({ title, description, path: "/community" }),
};

/**
 * A page of its own, so the community link can be shared on its own. The
 * design has no frame for it, so it is built from the redesign's parts, as
 * the "Nothing scheduled" boxes are: the heading and what joining gives on
 * the left, the form in a panel on the right (paper, a 1px field-border edge,
 * the 4px radius), stacked on a phone. The form's red button is the page's
 * one, and there is no community band below: this page is the ask.
 */
export default function CommunityPage() {
  return (
    <div className="container-site grid gap-8 pt-12 pb-16 lg:grid-cols-[662fr_466fr] lg:gap-6 lg:pt-24 lg:pb-28">
      <div className="flex flex-col gap-5 lg:gap-6">
        <h1 className="type-h1 text-ink">Be a builder, not just a spectator.</h1>
        <div className="flex max-w-[564px] flex-col gap-3 lg:gap-4">
          <p className="type-lead text-ink-muted">
            Antitect’s community is where most people start. You’ll hear about webinars before they’re announced
            publicly, get practical resources, and build alongside people doing the same thing.
          </p>
          <p className="type-meta font-medium text-ink-muted">Free · Leave any time</p>
        </div>
      </div>
      <Panel aria-label={title} className="self-start">
        <CommunityForm idPrefix="page-community" />
      </Panel>
    </div>
  );
}
