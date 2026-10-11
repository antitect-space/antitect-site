import { StatusGlyph, StatusLabel } from "@/components/handover/status-label";
import type { Status, Stepped } from "@/content/handover";
import { cn } from "@/lib/utils";

import s from "./handover.module.css";

export { s as styles };

/**
 * A handover card's frame: "Today", the divider with its arrow, "With AI",
 * and the caption. The card is drawn for the eye: its states overlap, so a
 * screen reader would hear both at once. It is hidden from them, and
 * `description` says in a sentence what it shows.
 *
 * `data-sequence` and `data-times` are what the motion script reads; with no
 * step set, the card is at its end.
 */
export function HandoverCard({
  name,
  size = "small",
  times,
  caption,
  description,
  trigger = "view",
  today,
  withAi,
}: {
  name: string;
  size?: "small" | "large";
  times: readonly number[];
  caption: string;
  description: string;
  /** "load" for the hero's card, which plays as the page opens. */
  trigger?: "load" | "view";
  today: React.ReactNode;
  withAi: React.ReactNode;
}) {
  const end = times.length - 1;

  return (
    <figure className={cn(s.card, size === "large" && s.large)}>
      <p className="sr-only">{description}</p>
      <div
        aria-hidden="true"
        data-sequence={name}
        data-times={times.join(",")}
        data-trigger={trigger}
        className={s.frame}
      >
        <div className={s.half}>
          <p className={s.meta}>Today</p>
          {today}
        </div>
        <div className={s.divider}>
          <span className={s.badge}>
            <svg viewBox="0 0 16 16" className={s.arrow} data-from={1} data-draw="">
              <path pathLength={1} d="M2 8h12m-5-5l5 5-5 5" />
            </svg>
          </span>
        </div>
        <div className={s.half}>
          <p className={cn(s.meta, s.labelRow)}>
            With AI
            <Swap>
              <Step until={end} className={s.dots}>
                <span />
                <span />
                <span />
              </Step>
              <Step from={end}>
                <StatusGlyph icon="tick" className={s.mark} />
              </Step>
            </Swap>
          </p>
          {withAi}
        </div>
      </div>
      <figcaption className={s.caption}>{caption}</figcaption>
    </figure>
  );
}

/** Something that appears at step `from`, or gives way at step `until`. */
export function Step({
  from,
  until,
  rise = false,
  lag,
  as: Tag = "span",
  className,
  children,
}: {
  from?: number;
  until?: number;
  /** Rises 6px as it fades in. */
  rise?: boolean;
  /** Held back this long after its step, in ms, so changes in one step can follow each other. */
  lag?: number;
  as?: "span" | "p" | "div" | "li";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Tag
      data-from={from && from > 0 ? from : undefined}
      data-until={until}
      data-rise={rise ? "" : undefined}
      style={lag ? { transitionDelay: `${lag}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Several states in one cell, so the cell is always the size of the largest. */
export function Swap({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn(s.swap, className)}>{children}</span>;
}

/** A line of text that changes as the card plays, such as a summary or a count. */
export function SteppedText({ items, className }: { items: readonly Stepped[]; className?: string }) {
  return (
    <Swap className={className}>
      {items.map((item) => (
        <Step key={item.text} from={item.from} until={item.until}>
          {item.text}
        </Step>
      ))}
    </Swap>
  );
}

/**
 * A status label that changes at step `at`. The new one follows 250ms behind
 * the step, so the change it reports lands first.
 */
export function StatusSwap({ before, after, at }: { before: Status; after: Status; at: number }) {
  return (
    <Swap>
      <Step until={at}>
        <StatusLabel tone={before.tone} icon={before.icon}>
          {before.label}
        </StatusLabel>
      </Step>
      <Step from={at} lag={250}>
        <StatusLabel tone={after.tone} icon={after.icon}>
          {after.label}
        </StatusLabel>
      </Step>
    </Swap>
  );
}

/** A checkbox, ticked at step `at`. */
export function Checkbox({ at, lag }: { at: number; lag?: number }) {
  return (
    <Swap>
      <span className={s.box} />
      <Step from={at} lag={lag} className={cn(s.box, s.boxTicked)}>
        <StatusGlyph icon="tick" />
      </Step>
    </Swap>
  );
}
