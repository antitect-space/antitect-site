import { LoopDiagram } from "@/components/loop-diagram";
import { Reveal } from "@/components/motion/reveal";
import { method } from "@/content/method";

/**
 * The loop is the most distinctive thing Antitect has, so it is drawn rather
 * than listed: a ring on the desktop that fills as you scroll, and five
 * blocks of real text that carry it everywhere else.
 */
export function LoopSection() {
  const names = method.map((step) => step.name);

  return (
    <section id="how-it-works" aria-labelledby="loop-title" className="scroll-mt-4 border-b bg-muted">
      <div className="container-page py-16 lg:py-24">
        <h2 id="loop-title" className="text-display max-w-[16ch] text-4xl sm:text-5xl lg:text-6xl">
          Learn. Build. Review. Improve. Apply.
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <div className="hidden lg:sticky lg:top-[20vh] lg:block lg:self-start">
            <LoopDiagram steps={names} />
          </div>

          <ol className="grid gap-8 lg:gap-0">
            {method.map((step, index) => (
              <li
                key={step.name}
                data-step={index}
                className="border-t-2 border-foreground pt-5 lg:flex lg:min-h-[38vh] lg:flex-col lg:justify-center lg:border-t-0 lg:pt-0"
              >
                <Reveal kind="rise" delay={index * 60}>
                  <span aria-hidden="true" className="text-[0.9375rem] font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-title mt-3 text-3xl sm:text-4xl">{step.name}</h3>
                  <p className="mt-2 max-w-[40ch] text-lg leading-[1.5] text-muted-foreground">{step.detail}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 flex items-center gap-3 border-t-2 border-foreground pt-5 text-lg font-semibold lg:mt-4">
          <span aria-hidden="true" className="text-brand">
            ↻
          </span>
          Then the next project starts it again.
        </p>
      </div>
    </section>
  );
}
