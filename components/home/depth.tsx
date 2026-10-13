import { cn } from "@/lib/utils";

const LEVELS = [1, 2, 3] as const;

/**
 * How deep a format goes (design section 06): three segments, the filled ones
 * showing depth, the empty ones outlined so the scale of three is always
 * visible, with the time beside it. Read out as one phrase, "Depth 1 of 3,
 * about 2 hours", rather than as three shapes and a label.
 */
export function Depth({ level, time, className }: { level: 1 | 2 | 3; time: string; className?: string }) {
  return (
    <div role="img" aria-label={`Depth ${level} of 3, ${time.toLowerCase()}`} className={cn("flex items-center gap-3", className)}>
      <span className="flex items-center gap-[3px]">
        {LEVELS.map((segment) => (
          <span key={segment} className={cn("h-2 w-5 border border-field-border", segment <= level && "bg-ink")} />
        ))}
      </span>
      <span className="type-meta font-medium text-ink-muted">{time}</span>
    </div>
  );
}
