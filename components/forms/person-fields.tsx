"use client";

import { useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NIGERIAN_STATES, OUTSIDE_NIGERIA, stateLabel } from "@/lib/locations";
import type { PersonBody, PersonInput } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/**
 * The same person, asked the same way, on every form: event, checkout,
 * enrolment and community. The phone is labelled as the WhatsApp number
 * because reminders can go there; the checkbox is consent, not a preference.
 * Location is a state, or "Outside Nigeria" and a country.
 */
export function PersonFields({
  register,
  control,
  errors,
  idPrefix,
  consentLabel = "You can message me on WhatsApp about this",
}: {
  register: UseFormRegister<PersonInput>;
  control: Control<PersonInput, unknown, PersonBody>;
  errors: FieldErrors<PersonInput>;
  /** Keeps ids unique when two forms share a page. */
  idPrefix: string;
  consentLabel?: string;
}) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const describedBy = (name: keyof PersonInput, hint = false) =>
    errors[name] ? id(`${name}-error`) : hint ? id(`${name}-hint`) : undefined;
  const outside = useWatch({ control, name: "state" }) === OUTSIDE_NIGERIA;

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

      <Field id={id("state")} label="State" error={errors.state?.message}>
        <Select
          id={id("state")}
          autoComplete="address-level1"
          aria-invalid={errors.state ? true : undefined}
          aria-describedby={describedBy("state")}
          {...register("state")}
        >
          <option value="" disabled>
            Choose your state
          </option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {stateLabel(state)}
            </option>
          ))}
          <option disabled>──────────</option>
          <option value={OUTSIDE_NIGERIA}>{OUTSIDE_NIGERIA}</option>
        </Select>
      </Field>

      {outside ? (
        <Field id={id("country")} label="Country" error={errors.country?.message}>
          <Input
            id={id("country")}
            autoComplete="country-name"
            aria-invalid={errors.country ? true : undefined}
            aria-describedby={describedBy("country")}
            {...register("country")}
          />
        </Field>
      ) : null}

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

/** A native select dressed like the inputs: the phone's own picker, and no JavaScript of its own. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-input bg-background pr-10 pl-3 text-base text-foreground outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20 aria-invalid:border-brand aria-invalid:ring-2 aria-invalid:ring-brand/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className="pointer-events-none absolute top-1/2 right-3.5 h-2 w-3 -translate-y-1/2 fill-none stroke-foreground stroke-[1.5]"
      >
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
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
