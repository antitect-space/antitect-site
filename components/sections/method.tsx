import { method } from "@/content/method";

export function MethodSection() {
  return (
    <section id="how-it-works" aria-labelledby="method-title" className="scroll-mt-4 border-b bg-muted">
      <div className="container-page py-16 lg:py-24">
        <h2 id="method-title" className="text-display text-4xl sm:text-5xl">
          Learn. Build. Review. Improve. Apply.
        </h2>
        <p className="mt-6 max-w-[62ch] text-lg leading-[1.6] text-muted-foreground">
          Every Antitect programme runs on the same loop. It is the reason people finish with working
          projects instead of half-watched videos.
        </p>

        <ol className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">
          {method.map((step, index) => (
            <li key={step.name} className="bg-background p-6 lg:min-h-64 lg:p-7">
              <span aria-hidden="true" className="text-sm font-semibold text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title mt-6 text-3xl">{step.name}</h3>
              <p className="mt-3 leading-[1.6] text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
