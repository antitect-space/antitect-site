"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * The form parts the learner and tutor areas use, exactly as they were before
 * the public site's redesign. The public forms have their own
 * (components/forms/fields.tsx), so restyling those never reaches somebody
 * signing in, booking a review or sending work.
 */

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
  /**
   * One thing wrong, or several. A password can miss three requirements at
   * once, and telling somebody about them one failed attempt at a time is a
   * way of wasting their afternoon.
   */
  error?: string | string[];
  children: React.ReactNode;
}) {
  const problems = error === undefined ? [] : Array.isArray(error) ? error : [error];

  // content-start: side by side with a field showing an error, this one is
  // stretched to the same height, and without it the extra space is shared
  // among its rows and its label and input drift down out of line.
  return (
    <div className="grid content-start gap-2">
      <Label htmlFor={id} className="text-[0.9375rem] font-semibold">
        {label}
        {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      {children}
      {hint && problems.length === 0 ? (
        <p id={`${id}-hint`} className="text-sm leading-[1.5] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {problems.length === 1 ? (
        <p id={`${id}-error`} className="text-sm leading-[1.5] font-medium text-brand">
          {problems[0]}
        </p>
      ) : null}
      {problems.length > 1 ? (
        <ul id={`${id}-error`} className="grid gap-1 text-sm leading-[1.5] font-medium text-brand">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** The line above the submit button when something went wrong that is not a field. */
export function FormAlert({ message, className }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("border-l-4 border-brand bg-muted px-4 py-3 leading-[1.5]", className)}>
      {message}
    </p>
  );
}

/** Reassurance on a slow connection, without moving anything around. */
export function SlowNote({ show }: { show: boolean }) {
  return (
    <p aria-live="polite" className="mt-3 min-h-[1.5em] text-[0.9375rem] text-muted-foreground">
      {show ? "Still working. This can take a moment on a slow connection." : ""}
    </p>
  );
}
