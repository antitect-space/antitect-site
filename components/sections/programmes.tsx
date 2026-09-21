import { ProgrammeCard } from "@/components/programme-card";
import type { PublicProgram } from "@/lib/api";

export function ProgrammesSection({ programs }: { programs: PublicProgram[] }) {
  return (
    <section id="programmes" aria-labelledby="programmes-title" className="scroll-mt-4 border-b bg-muted">
      <div className="container-page py-16 lg:py-24">
        <h2 id="programmes-title" className="text-display text-4xl sm:text-5xl">
          Capability Development Programmes
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">Weeks, not an afternoon.</p>

        <div className="mt-10 grid gap-6 lg:mt-12">
          {programs.map((program) => (
            <ProgrammeCard key={program.slug} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
}
