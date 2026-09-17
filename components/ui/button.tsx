import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * `default` is brand red and is reserved for the one action a section wants
 * clicked. Everything else is black on white. Sizes are thumb-sized: the
 * smallest is 44px tall.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-[#a90e11]",
        secondary: "bg-foreground text-background hover:bg-[#262626]",
        outline: "border-foreground bg-transparent text-foreground hover:bg-muted",
        inverse: "border-background bg-transparent text-background hover:bg-white/10",
        link: "h-auto px-0 text-foreground underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
      },
    },
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
