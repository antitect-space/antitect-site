import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/logo-paths";
import { wordmark } from "@/lib/fonts/wordmark";
import { cn } from "@/lib/utils";

/**
 * The AT monogram. The A follows the surrounding text colour. The T is brand
 * red, unless `mono`, which spends none of the page's red budget.
 */
export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto w-7", className)}
    >
      <path fill="currentColor" d={LOGO_PATHS.a} />
      <path fill={mono ? "currentColor" : "var(--brand)"} d={LOGO_PATHS.t} />
    </svg>
  );
}

/**
 * Mark plus wordmark, as the learner and tutor areas have always shown it:
 * the wordmark in the area's own face. The tracked capitals are the logo
 * treatment and belong here only.
 */
export function Logo({
  className,
  mono = false,
  wordmarkClassName,
}: {
  className?: string;
  mono?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark mono={mono} />
      <span className={cn("text-[0.9375rem] font-bold tracking-[0.18em]", wordmarkClassName)}>ANTITECT</span>
    </span>
  );
}

/**
 * The redesign's lockup (design section 01): the mark 28px tall on a phone and
 * 36px from `lg`, and the wordmark in Archivo ExtraBold at 0.55 of the mark's
 * height, tracked 0.18em. The wordmark is drawn from a 1KB subset of its own
 * letters, so it never waits on, or costs, a whole font.
 */
export function Lockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink lg:gap-2.5", className)}>
      <LogoMark className="h-7 w-auto lg:h-9" />
      <span className={cn(wordmark.className, "text-[15.4px] leading-none tracking-[0.18em] lg:text-[19.8px]")}>
        ANTITECT
      </span>
    </span>
  );
}
