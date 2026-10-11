"use client";

import { useState, type ReactNode } from "react";

/**
 * The phone's photo strip (design section 08): the browser's own sideways
 * scrolling, snapping to each photograph, and a "1 / 5" counter so it is
 * plain the rest are there. The counter only reads the scroll position;
 * without JavaScript the strip scrolls just the same.
 */
export function PhotoSwipe({ count, children }: { count: number; children: ReactNode }) {
  const [current, setCurrent] = useState(1);

  return (
    <div className="flex flex-col gap-3">
      <div
        onScroll={(event) => {
          const strip = event.currentTarget;
          const slide = strip.firstElementChild as HTMLElement | null;
          if (!slide) return;
          const step = slide.offsetWidth + 12;
          const next = Math.min(count, Math.max(1, Math.round(strip.scrollLeft / step) + 1));
          if (next !== current) setCurrent(next);
        }}
        className="flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <p aria-hidden="true" className="type-meta flex gap-2 px-5 text-ink-faint">
        <span className="font-medium tabular-nums">
          {current} / {count}
        </span>
        <span>Swipe for more</span>
      </p>
    </div>
  );
}
