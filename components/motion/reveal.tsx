"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

type Kind = "wipe" | "rise" | "blade";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The site's signature movement: things arrive along the mark's angle.
 *
 * The hidden state is set here, in the browser, rather than in the markup, so
 * content is never waiting on a script that may never run. With JavaScript
 * off, or with reduced motion asked for, everything is simply visible.
 */
export function Reveal({
  kind = "rise",
  delay = 0,
  trigger = "view",
  className,
  children,
}: {
  kind?: Kind;
  delay?: number;
  /** "load" for the one orchestrated moment in the hero; "view" for everything else. */
  trigger?: "load" | "view";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (delay) element.style.setProperty(`--${kind}-delay`, `${delay}ms`);

    if (trigger === "load") {
      element.dataset[kind] = "pending";
      const frame = requestAnimationFrame(() => {
        element.dataset[kind] = "in";
      });
      return () => cancelAnimationFrame(frame);
    }

    // Already on screen: there is nothing to reveal, and hiding it first would
    // be a flash of missing content for no gain.
    const box = element.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    element.dataset[kind] = "pending";

    const reveal = () => {
      element.dataset[kind] = "in";
      observer.disconnect();
      clearTimeout(failsafe);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );

    // Nothing stays hidden waiting on an observer that may never fire.
    const failsafe = setTimeout(reveal, 2500);

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearTimeout(failsafe);
    };
  }, [kind, delay, trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
