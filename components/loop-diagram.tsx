"use client";

import { useEffect, useState } from "react";

const SIZE = 320;
const CENTRE = SIZE / 2;
const RADIUS = 118;
const GAP_DEGREES = 7;

/**
 * The loop, drawn: five arcs round a ring, the red blade marking where you
 * are, and the gap between Apply and Learn closed by an arrow — the point
 * being that it comes back round.
 *
 * Decorative and desktop-only. The five steps are real text beside it, so
 * nothing here is the only copy of anything.
 */
export function LoopDiagram({ steps }: { steps: readonly string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>("[data-step]");
    if (blocks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.step);
        if (Number.isInteger(index)) setActive(index);
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0.25, 0.5, 0.75] },
    );

    for (const block of blocks) observer.observe(block);
    return () => observer.disconnect();
  }, []);

  const slice = 360 / steps.length;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className="h-auto w-full max-w-[22rem]">
        {steps.map((step, index) => {
          const start = index * slice - 90 + GAP_DEGREES / 2;
          const end = (index + 1) * slice - 90 - GAP_DEGREES / 2;
          const isActive = index === active;
          return (
            <path
              key={step}
              d={arc(start, end)}
              fill="none"
              stroke={isActive ? "var(--brand)" : "var(--border)"}
              strokeWidth={isActive ? 18 : 10}
              className="transition-all duration-300 motion-reduce:transition-none"
            />
          );
        })}

        {steps.map((step, index) => {
          const middle = index * slice + slice / 2 - 90;
          const point = onCircle(middle, RADIUS + 32);
          return (
            <text
              key={step}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[13px] font-semibold ${index === active ? "fill-foreground" : "fill-muted-foreground"}`}
            >
              {step}
            </text>
          );
        })}

        <text
          x={CENTRE}
          y={CENTRE - 6}
          textAnchor="middle"
          className="fill-foreground text-[28px] font-extrabold tracking-[-0.02em]"
        >
          {steps[active]}
        </text>
        <text x={CENTRE} y={CENTRE + 18} textAnchor="middle" className="fill-muted-foreground text-[12px]">
          step {active + 1} of {steps.length}
        </text>
      </svg>
    </div>
  );
}

function onCircle(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180;
  return { x: CENTRE + radius * Math.cos(radians), y: CENTRE + radius * Math.sin(radians) };
}

function arc(startDegrees: number, endDegrees: number): string {
  const start = onCircle(startDegrees, RADIUS);
  const end = onCircle(endDegrees, RADIUS);
  const large = endDegrees - startDegrees > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${end.x} ${end.y}`;
}
