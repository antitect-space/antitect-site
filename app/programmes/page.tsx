import type { Metadata } from "next";
import Link from "next/link";

import { CutFrame } from "@/components/cut";
import { ProgrammeCard } from "@/components/programme-card";
import { Button } from "@/components/ui/button";
import { getPrograms } from "@/lib/api";
import { shareMetadata } from "@/lib/metadata";

export const revalidate = 60;

const title = "AI Capability Development Programmes";
const description =
  "Structured, instructor-led AI programmes with weekly one-to-one project reviews. Built for working professionals in Nigeria.";

export const metadata: Metadata = {
  title,
  ...shareMetadata({ title: `${title} — Antitect`, description, path: "/programmes" }),
};

export default async function ProgrammesPage() {
  const programs = await getPrograms();

  return (
    <div className="container-page py-12 sm:py-16 lg:py-20">
      <h1 className="text-display text-5xl sm:text-6xl">Capability Development Programmes</h1>
      <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
        Weeks of guided work, with your own project reviewed every week.
      </p>

      {programs.length > 0 ? (
        <div className="mt-12 grid gap-6">
          {programs.map((program) => (
            <ProgrammeCard key={program.slug} program={program} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <CutFrame corner="tr" className="mt-12 max-w-2xl" innerClassName="p-6 sm:p-8">
          <p className="text-title text-2xl">No cohort is open for enrolment right now.</p>
          <p className="mt-3 text-lg leading-[1.6] text-muted-foreground">
            Join the community and you will hear first when the next one opens.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/community">Join the community</Link>
          </Button>
        </CutFrame>
      )}
    </div>
  );
}
