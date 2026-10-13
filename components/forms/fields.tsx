"use client";

import { forwardRef } from "react";

import { ChevronDown, Spinner } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The public forms' parts (design W1 and C1): labels above inputs and never
 * inside them, optional fields saying so in the label, hints between the
 * label and the input, errors under the field in red with the border turned
 * red, and values that stay filled in. Inputs are 48px tall with 16px text,
 * so a phone does not zoom in on them.
 *
 * The learner and tutor areas keep their own parts (components/area/form-parts.tsx).
 */

const control =
  "h-12 w-full min-w-0 rounded-md border border-field-border bg-paper px-3 text-base leading-[1.25] text-ink outline-none placeholder:text-ink-muted aria-invalid:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";

export const TextInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(control, className)} {...props} />;
});

/** A native select dressed like the inputs: the phone's own picker, and no script of its own. */
export const SelectInput = forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(function SelectInput(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink" />
    </div>
  );
});

export function Field({
  id,
  label,
  optional = false,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  // content-start: beside a field showing an error, this one is stretched to
  // the same height, and its label and input must not drift down out of line.
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="type-small flex flex-wrap gap-x-1 font-semibold text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-muted">(optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="type-small text-ink-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-small text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A real checkbox, 24px, with its label beside it and a 44px row to tap. */
export const Checkbox = forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { label: string }>(
  function Checkbox({ id, label, className, ...props }, ref) {
    return (
      <div className={cn("flex items-start gap-3 py-2.5", className)}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="size-6 shrink-0 rounded-md border border-field-border accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
          {...props}
        />
        <label htmlFor={id} className="pt-px text-base leading-[1.5] text-ink">
          {label}
        </label>
      </div>
    );
  },
);

/** The line above the submit button when something went wrong that is not a field. */
export function FormAlert({ message, className }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("type-small border-l-4 border-brand bg-wash py-3 pr-4 pl-5 text-ink", className)}>
      {message}
    </p>
  );
}

/**
 * Reassurance on a slow connection, under the busy button after eight
 * seconds. It is always in the page, empty until then, so a screen reader
 * hears it arrive; empty, it takes no room.
 */
export function SlowNote({ show, className }: { show: boolean; className?: string }) {
  return (
    <p role="status" className={cn("type-body text-ink not-empty:mt-3", className)}>
      {show ? "Still working. This can take a moment on a slow connection." : ""}
    </p>
  );
}

/**
 * The form's one action. Busy, it keeps its width and its colour (the red
 * darkens, it does not fade), shows a spinner beside the words for what is
 * happening, and says it is busy.
 *
 * Busy, it refuses a second submit rather than being disabled: a disabled
 * button drops keyboard focus to the top of the page, and someone on a slow
 * connection would have to find their way back to it.
 */
export function SubmitButton({
  busy,
  busyLabel,
  children,
  variant = "default",
  className,
}: {
  busy: boolean;
  busyLabel: string;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      className={cn("w-full px-5", busy && "cursor-progress", busy && variant === "default" && "bg-brand-pressed", className)}
      aria-disabled={busy || undefined}
      aria-busy={busy || undefined}
      onClick={busy ? (event) => event.preventDefault() : undefined}
    >
      {busy ? (
        <>
          <Spinner />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** The heading and line every panel and form opens with. */
export function FormHead({
  id,
  title,
  line,
  headingRef,
  as: Heading = "h2",
}: {
  id?: string;
  title: string;
  line?: React.ReactNode;
  headingRef?: React.Ref<HTMLHeadingElement>;
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Focusable from script, never by Tab: a panel moves focus here when it changes under somebody. */}
      <Heading id={id} ref={headingRef} tabIndex={-1} className="type-h3 text-ink outline-none">
        {title}
      </Heading>
      {line ? <p className="type-body text-ink-muted">{line}</p> : null}
    </div>
  );
}
