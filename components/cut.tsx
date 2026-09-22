import { cn } from "@/lib/utils";

const CORNERS = {
  tl: "cut-tl",
  tr: "cut-tr",
  br: "cut-br",
  bl: "cut-bl",
} as const;

export type Corner = keyof typeof CORNERS;

/**
 * A frame with one corner cut at the mark's angle, outlined the whole way
 * round — diagonal included.
 *
 * A border cannot survive `clip-path`: the browser clips the corner off and
 * the cut edge comes out bare, which reads as a mistake rather than a cut. So
 * the frame is two shapes instead: a filled one in the line colour, and the
 * surface inset inside it by the line's width. What is left showing along
 * every edge, diagonal included, is the line.
 */
/**
 * The same cut with no line, for photographs.
 *
 * A picture already has an edge of its own, so a frame around it only thickens
 * the page. The line is for boxes, where it is the thing holding the shape
 * together.
 */
export function Cut({
  corner = "tr",
  className,
  children,
}: {
  corner?: Corner;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(CORNERS[corner], className)}>{children}</div>;
}

export function CutFrame({
  corner = "tr",
  tone = "page",
  className,
  innerClassName,
  children,
}: {
  corner?: Corner;
  /** "page" is white inside a black line; "ink" is a black panel, which needs no line. */
  tone?: "page" | "ink";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  const cut = CORNERS[corner];

  return (
    <div className={cn("bg-foreground p-[2px]", cut, className)}>
      <div
        className={cn(
          "h-full w-full",
          cut,
          tone === "ink" ? "bg-foreground text-background" : "bg-background",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
