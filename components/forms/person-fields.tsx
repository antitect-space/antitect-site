"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PersonInput } from "@/lib/schemas";

/**
 * The same person, asked the same way, on every form: event, checkout,
 * enrolment and community. The phone is labelled as the WhatsApp number
 * because reminders can go there; the checkbox is consent, not a preference.
 */
export function PersonFields({
  register,
  errors,
  idPrefix,
  consentLabel = "You can message me on WhatsApp about this",
}: {
  register: UseFormRegister<PersonInput>;
  errors: FieldErrors<PersonInput>;
  /** Keeps ids unique when two forms share a page. */
  idPrefix: string;
  consentLabel?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const describedBy = (name: keyof PersonInput, hint = false) =>
    errors[name] ? id(`${name}-error`) : hint ? id(`${name}-hint`) : undefined;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("firstName")} label="First name" error={errors.firstName?.message}>
          <Input
            id={id("firstName")}
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={describedBy("firstName")}
            {...register("firstName")}
          />
        </Field>
        <Field id={id("lastName")} label="Last name" optional error={errors.lastName?.message}>
          <Input
            id={id("lastName")}
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={describedBy("lastName")}
            {...register("lastName")}
          />
        </Field>
      </div>

      <Field id={id("email")} label="Email address" error={errors.email?.message}>
        <Input
          id={id("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={describedBy("email")}
          {...register("email")}
        />
      </Field>

      <Field
        id={id("phone")}
        label="WhatsApp number"
        hint="A Nigerian number can start with 0. Any other needs its country code, such as +233."
        error={errors.phone?.message}
      >
        <Input
          id={id("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={describedBy("phone", true)}
          {...register("phone")}
        />
      </Field>

      <div className="flex items-start gap-3">
        <input
          id={id("whatsappOptIn")}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 accent-foreground"
          {...register("whatsappOptIn")}
        />
        <label htmlFor={id("whatsappOptIn")} className="leading-[1.5]">
          {consentLabel}
        </label>
      </div>
    </div>
  );
}

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
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-[0.9375rem] font-semibold">
        {label}
        {optional ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
      </Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm leading-[1.5] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm leading-[1.5] font-medium text-brand">
          {error}
        </p>
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
