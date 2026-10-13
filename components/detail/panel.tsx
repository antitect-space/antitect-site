import { cn } from "@/lib/utils";

/**
 * The box every registration, reservation and enrolment panel sits in
 * (design W5, C6 and C7): paper, a 1px field-border edge, the 4px radius,
 * 32px in from the edge on a desktop and 24 on a phone. Its parts stack 24px
 * apart.
 */
export function Panel({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("flex flex-col gap-6 rounded-md border border-field-border bg-paper p-6 lg:p-8", className)}
      {...props}
    >
      {children}
    </section>
  );
}
