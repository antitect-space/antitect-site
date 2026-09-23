import type { Metadata } from "next";

import { CutFrame } from "@/components/cut";
import { CommunityForm } from "@/components/forms/community-form";
import { shareMetadata } from "@/lib/metadata";

const title = "Join the community";
const description =
  "Hear about AI webinars and workshops in Lagos and online before they are announced publicly, and build alongside people doing the same. Free to join.";

export const metadata: Metadata = {
  title: { absolute: `${title} — Antitect` },
  ...shareMetadata({ title, description, path: "/community" }),
};

/** A page of its own, so the community link can be shared on its own. */
export default function CommunityPage() {
  return (
    <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-20">
      <div>
        <h1 className="text-display text-5xl sm:text-6xl">Be a builder, not just a spectator.</h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-[1.6] text-muted-foreground">
          Antitect&apos;s community is where most people start. You will hear about webinars before they are
          announced publicly, get practical resources, and build alongside people doing the same thing.
        </p>
        <p className="mt-4 text-lg font-semibold">Free to join.</p>
      </div>
      <CutFrame corner="bl" className="self-start" innerClassName="p-6 sm:p-8">
        <CommunityForm idPrefix="page-community" />
      </CutFrame>
    </div>
  );
}
