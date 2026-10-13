"use client";

import { useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { Checkbox, Field, SelectInput, TextInput } from "@/components/forms/fields";
import { NIGERIAN_STATES, OUTSIDE_NIGERIA, stateLabel } from "@/lib/locations";
import type { PersonBody, PersonInput } from "@/lib/schemas";

/**
 * The same person, asked the same way, on every form: a webinar, a workshop,
 * a programme and the community (design W1 and C1). The phone is labelled as
 * the WhatsApp number because reminders can go there; the checkbox is
 * consent, not a preference, and starts unticked. Location is optional: a
 * state, or "Outside Nigeria" and then a country.
 *
 * The first and last name sit side by side wherever the form is wide enough
 * (a container query, so it holds in a panel and on a page alike) and stack
 * on a phone.
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
    [hint ? id(`${name}-hint`) : null, errors[name] ? id(`${name}-error`) : null].filter(Boolean).join(" ") ||
    undefined;
  const outside = useWatch({ control, name: "state" }) === OUTSIDE_NIGERIA;

  return (
    <div className="@container">
      <div className="grid gap-5">
        <div className="grid gap-5 @min-[360px]:grid-cols-2 @min-[360px]:gap-4">
          <Field id={id("firstName")} label="First name" error={errors.firstName?.message}>
            <TextInput
              id={id("firstName")}
              autoComplete="given-name"
              aria-invalid={errors.firstName ? true : undefined}
              aria-describedby={describedBy("firstName")}
              {...register("firstName")}
            />
          </Field>
          <Field id={id("lastName")} label="Last name" optional error={errors.lastName?.message}>
            <TextInput
              id={id("lastName")}
              autoComplete="family-name"
              aria-invalid={errors.lastName ? true : undefined}
              aria-describedby={describedBy("lastName")}
              {...register("lastName")}
            />
          </Field>
        </div>

        <Field id={id("email")} label="Email address" error={errors.email?.message}>
          <TextInput
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
          <TextInput
            id={id("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone", true)}
            {...register("phone")}
          />
        </Field>

        <Field id={id("state")} label="State" optional error={errors.state?.message}>
          <SelectInput
            id={id("state")}
            autoComplete="address-level1"
            aria-invalid={errors.state ? true : undefined}
            aria-describedby={describedBy("state")}
            {...register("state")}
          >
            <option value="">Choose your state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {stateLabel(state)}
              </option>
            ))}
            <option disabled>──────────</option>
            <option value={OUTSIDE_NIGERIA}>{OUTSIDE_NIGERIA}</option>
          </SelectInput>
        </Field>

        {outside ? (
          <Field id={id("country")} label="Country" error={errors.country?.message}>
            <TextInput
              id={id("country")}
              autoComplete="country-name"
              aria-invalid={errors.country ? true : undefined}
              aria-describedby={describedBy("country")}
              {...register("country")}
            />
          </Field>
        ) : null}

        <Checkbox id={id("whatsappOptIn")} label={consentLabel} {...register("whatsappOptIn")} />
      </div>
    </div>
  );
}
