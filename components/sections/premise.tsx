/**
 * The question, and nothing else. The photographs immediately below are the
 * answer, so a paragraph here would only get in their way.
 */
export function PremiseSection() {
  return (
    <section aria-labelledby="premise-title" className="border-b">
      <div className="container-page py-16 lg:py-24">
        <h2 id="premise-title" className="text-display max-w-[14ch] text-5xl sm:text-6xl lg:text-7xl">
          You have watched the tutorials. What have you built?
        </h2>
        <p className="mt-8 max-w-[46ch] text-xl leading-[1.5] text-muted-foreground">
          Antitect exists for the part after watching: the building, and somebody checking the work.
        </p>
      </div>
    </section>
  );
}
