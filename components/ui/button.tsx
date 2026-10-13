import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * The design's buttons (section 04). `default` is the red primary: at most one
 * on a screen, for the one action that screen wants. `secondary` is ink,
 * `outline` an ink edge, `inverse` paper for use on ink, `text` the design's
 * text link with its arrow, and `link` the older underlined one. Sizes are
 * thumb-sized: `lg` is 48px, the default 44.
 *
 * Focus is a 2px ring at a 2px offset in `--focus-ring`: ink on paper, paper
 * on ink (`surface-ink` sets it).
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent font-semibold whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-brand-pressed active:bg-brand-pressed",
        secondary: "bg-ink text-paper hover:bg-ink/88",
        outline: "border-ink bg-transparent text-ink hover:bg-wash",
        inverse: "bg-paper text-ink hover:bg-wash",
        text: "bg-transparent text-ink underline-offset-4 hover:underline",
        link: "h-auto px-0 text-foreground underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
      },
    },
    compoundVariants: [{ variant: "text", class: "px-0" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
