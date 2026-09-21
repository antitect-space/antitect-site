import { Reveal } from "@/components/motion/reveal";
import { reasons } from "@/content/why";

/** Three claims, each one somebody could go and check. */
export function WhySection() {
  return (
    <section aria-labelledby="why-title" className="border-b">
      <div className="container-page py-16 lg:py-24">
        <h2 id="why-title" className="text-display max-w-[18ch] text-4xl sm:text-5xl">
          Why this works when courses do not
        </h2>

        <ul className="mt-12 grid gap-x-12 gap-y-10 lg:mt-16 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <li key={reason.title}>
              <Reveal kind="rise" delay={index * 80}>
                <span aria-hidden="true" className="block h-1 w-16 bg-brand" />
                <h3 className="text-title mt-5 text-2xl sm:text-3xl">{reason.title}</h3>
                <p className="mt-3 text-lg leading-[1.5] text-muted-foreground">{reason.detail}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
