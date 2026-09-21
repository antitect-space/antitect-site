import Image from "next/image";

import { CutFrame } from "@/components/cut";
import { Reveal } from "@/components/motion/reveal";
import { method } from "@/content/method";

/**
 * The loop, as a dark panel of five steps beside the headline and a
 * photograph.
 *
 * It replaced a pinned ring that spent a screen and a half of scrolling on
 * five short lines. This says the same thing in one view, which is what the
 * section is for, and it costs no JavaScript at all.
 *
 * It still has to read as a loop rather than a list, so the last row sends you
 * back to the first: the one thing a numbered list cannot say on its own.
 */
export function LoopSection() {
  return (
    <section id="how-it-works" aria-labelledby="loop-title" className="scroll-mt-4 border-b bg-muted">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:py-24">
        <div>
          <p className="text-[0.9375rem] font-semibold text-muted-foreground">How it works</p>
          <h2 id="loop-title" className="text-display mt-4 text-4xl sm:text-5xl">
            Learn. Build. Review. Improve. Apply.
          </h2>
          <p className="mt-6 max-w-[34ch] text-lg leading-[1.5] text-muted-foreground">
            Every programme runs on the same loop.
          </p>

          <CutFrame corner="br" className="mt-10 hidden sm:block">
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-background">
              <Image
                src="/images/why-image.jpg"
                alt="Four people working together on laptops around a table."
                fill
                sizes="(min-width: 1024px) 26rem, 50vw"
                className="object-cover"
              />
            </div>
          </CutFrame>
        </div>

        <Reveal kind="wipe">
          <CutFrame corner="tr" tone="ink">
            <ol className="divide-y divide-background/15">
              {method.map((step, index) => (
                <li
                  key={step.name}
                  className="group flex gap-5 p-6 transition-colors duration-200 hover:bg-background/8 motion-reduce:transition-none sm:gap-6 sm:p-7"
                >
                  {/* Red, and the one place it appears in this section. White on
                      brand red is 5.6:1, which passes at this size. */}
                  <span
                    aria-hidden="true"
                    className="cut-tr grid size-10 shrink-0 place-items-center bg-brand text-[0.9375rem] font-extrabold tabular-nums text-brand-foreground transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0 sm:size-11"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-title text-xl sm:text-2xl">{step.name}</h3>
                    <p className="mt-1 leading-[1.5] text-background/75 transition-colors duration-200 group-hover:text-background motion-reduce:transition-none">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}

              <li className="flex items-center gap-5 p-6 sm:gap-6 sm:p-7">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center text-2xl text-background/70 sm:size-11"
                >
                  ↻
                </span>
                <p className="font-semibold">Then the next project starts it again.</p>
              </li>
            </ol>
          </CutFrame>
        </Reveal>
      </div>
    </section>
  );
}
