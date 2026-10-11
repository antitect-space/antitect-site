import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "attention" | "done";
export type StatusIcon = "tick" | "flag" | "clock" | "dash";

/**
 * A status label inside a task card (design section 14), and the only place
 * the status colours appear (rule 7). Neutral is waiting or not started;
 * attention needs a person or is still pending; done is handled. There is no
 * red status.
 */
export function StatusLabel({
  tone,
  icon,
  children,
  className,
}: {
  tone: StatusTone;
  icon: StatusIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "type-meta inline-flex w-max items-center gap-1 rounded-md px-1.5 py-0.5 font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      <StatusGlyph icon={icon} />
      {children}
    </span>
  );
}

const TONES: Record<StatusTone, string> = {
  neutral: "bg-status-neutral-bg text-status-neutral-fg",
  attention: "bg-status-attention-bg text-status-attention-fg",
  done: "bg-status-done-bg text-status-done-fg",
};

const GLYPHS: Record<StatusIcon, string> = {
  tick: "M2.5 6.5l2.5 2.5 4.5-5.5",
  flag: "M3 10.75v-9.25h6.5l-1.5 2.75 1.5 2.75h-6.5",
  clock: "M6 1.75a4.25 4.25 0 1 1-0.01 0z m0 2v2.25l1.6 1.1",
  dash: "M3 6h6",
};

/** The 12px marks the labels carry, also used on their own inside a card. */
export function StatusGlyph({ icon, className }: { icon: StatusIcon; className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("size-3 shrink-0", className)}
    >
      <path d={GLYPHS[icon]} />
    </svg>
  );
}
