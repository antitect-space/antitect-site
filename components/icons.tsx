import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The design's line icons (section 02): drawn only where they carry meaning,
 * 1.5px strokes in the text colour. Arrows are drawn rather than typed because
 * neither Public Sans nor Newsreader has "→". Every icon is decorative: the
 * words beside it say what it means.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox"> & { className?: string };

function Svg({ size, className, children, ...props }: IconProps & { size: number }) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRight({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M2 8h12m-5-5l5 5-5 5" />
    </Svg>
  );
}

export function ArrowLeft({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M14 8H2m5-5L2 8l5 5" />
    </Svg>
  );
}

export function ArrowDown({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M8 2v12m-5-5l5 5 5-5" />
    </Svg>
  );
}

export function Tick({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M2.5 8.5l4 4 7-8.5" />
    </Svg>
  );
}

export function Flag({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M3.5 14.5v-12.5h9l-2 3.5 2 3.5h-9" />
    </Svg>
  );
}

export function Plus({ className, ...props }: IconProps) {
  return (
    <Svg size={20} className={cn("size-5", className)} {...props}>
      <path d="M10 3v14m-7-7h14" />
    </Svg>
  );
}

export function Minus({ className, ...props }: IconProps) {
  return (
    <Svg size={20} className={cn("size-5", className)} {...props}>
      <path d="M3 10h14" />
    </Svg>
  );
}

export function Menu({ className, ...props }: IconProps) {
  return (
    <Svg size={24} className={cn("size-6", className)} {...props}>
      <path d="M3 6.5h18m-18 5.5h18m-18 5.5h18" />
    </Svg>
  );
}

export function Close({ className, ...props }: IconProps) {
  return (
    <Svg size={24} className={cn("size-6", className)} {...props}>
      <path d="M5.5 5.5l13 13m0-13l-13 13" />
    </Svg>
  );
}

/** Two corners pulled apart: a flyer's "View full size". */
export function Expand({ className, ...props }: IconProps) {
  return (
    <Svg size={16} strokeLinecap="square" className={cn("size-4", className)} {...props}>
      <path d="M9.5 2.5h4v4m0-4l-4.5 4.5m-2.5 6.5h-4v-4m0 4l4.5-4.5" />
    </Svg>
  );
}

export function ChevronDown({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4", className)} {...props}>
      <path d="M3.5 6l4.5 4.5 4.5-4.5" />
    </Svg>
  );
}

/** Three quarters of a circle. It turns only when motion is allowed. */
export function Spinner({ className, ...props }: IconProps) {
  return (
    <Svg size={16} className={cn("size-4 motion-safe:animate-spin", className)} {...props}>
      <path d="M8 2.75A5.25 5.25 0 1 1 2.75 8" />
    </Svg>
  );
}
