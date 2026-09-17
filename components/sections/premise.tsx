/** The confrontational register, once the reader is engaged. Names the problem so the method means something. */
export function PremiseSection() {
  return (
    <section aria-labelledby="premise-title" className="border-b">
      <div className="container-page grid gap-8 py-16 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-24">
        <h2 id="premise-title" className="text-display text-4xl sm:text-5xl">
          You have watched the tutorials. What have you built?
        </h2>
        <div className="max-w-[62ch] space-y-5 text-lg leading-[1.6]">
          <p>
            Most AI learning ends the same way. You finish the course, you understand the concepts, and
            nothing in your work actually changes. You cannot point at anything.
          </p>
          <p>
            Antitect is built the other way round. You start with a project you need to build. You learn
            what that project requires. An instructor reviews what you make and tells you how to make it
            better. You finish when it works.
          </p>
          <p className="font-semibold">
            The question at the end is not what you learned. It is what you can now do.
          </p>
        </div>
      </div>
    </section>
  );
}
