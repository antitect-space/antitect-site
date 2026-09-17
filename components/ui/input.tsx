import * as React from "react"
import { cn } from "cn"

/** 16px text on every screen: anything smaller makes iOS zoom on focus. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-brand aria-invalid:ring-2 aria-invalid:ring-brand/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
