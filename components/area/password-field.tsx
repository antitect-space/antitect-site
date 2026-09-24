"use client";

import { useState } from "react";

import { Field } from "@/components/forms/person-fields";
import { Input } from "@/components/ui/input";

/**
 * A password, with a way to see it. On a phone, a typo in a field you cannot
 * read is the commonest reason a correct password is refused, and hiding it
 * from the person typing protects nobody.
 */
export function PasswordField({
  id,
  label,
  hint,
  error,
  autoComplete,
  registration,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | string[];
  autoComplete: "current-password" | "new-password";
  registration: React.ComponentProps<"input">;
}) {
  const [shown, setShown] = useState(false);

  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <Input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          className="pr-16"
          aria-invalid={error && (!Array.isArray(error) || error.length > 0) ? true : undefined}
          aria-describedby={
            error && (!Array.isArray(error) || error.length > 0)
              ? `${id}-error`
              : hint
                ? `${id}-hint`
                : undefined
          }
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShown((was) => !was)}
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 px-3 text-[0.9375rem] font-semibold underline underline-offset-4 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
    </Field>
  );
}
