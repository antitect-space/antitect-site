"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * "1 / 5" under the photo strip on a phone, so it is obvious the rest are
 * there to swipe to. The strip itself is the browser's own scrolling; this
 * only reads its position.
 */
export function StripCounter({ count, children }: { count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);

  return (
    <>
      <div
        ref={ref}
        data-strip=""
        onScroll={(event) => {
          const strip = event.currentTarget;
          const width = strip.scrollWidth / count;
          const next = Math.min(count, Math.max(1, Math.round(strip.scrollLeft / width) + 1));
          if (next !== current) setCurrent(next);
        }}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <p aria-hidden="true" className="mt-3 text-[0.9375rem] tabular-nums text-muted-foreground md:hidden">
        {current} / {count}
      </p>
    </>
  );
}
