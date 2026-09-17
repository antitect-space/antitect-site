import { reasons } from "@/content/why";

export function WhySection() {
  return (
    <section aria-labelledby="why-title" className="border-b">
      <div className="container-page py-16 lg:py-24">
        <h2 id="why-title" className="text-display max-w-[20ch] text-4xl sm:text-5xl">
          Why this works when courses do not
        </h2>
        <ul className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.title} className="border-t-2 border-foreground pt-6">
              <h3 className="text-title text-2xl">{reason.title}</h3>
              <p className="mt-3 max-w-[56ch] text-lg leading-[1.6] text-muted-foreground">{reason.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
