"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormAlert, FormHead, SlowNote, SubmitButton } from "@/components/forms/fields";
import { PersonFields } from "@/components/forms/person-fields";
import {
  Registered,
  RegistrationFull,
  SessionStarted,
  type RegistrationEvent,
} from "@/components/forms/registration-states";
import { useSubmission } from "@/components/forms/use-submission";
import { registerForEvent, type RegistrationResponse } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { describeFailure } from "@/lib/form-errors";
import { hasStarted } from "@/lib/format";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";

type Outcome =
  | { kind: "form" }
  | { kind: "registered"; response: RegistrationResponse }
  | { kind: "full" }
  | { kind: "closed" };

/**
 * Registration for a free event, inside the registration panel (design W5).
 * The form never clears on a failed submit: on a slow connection, retyping is
 * where people give up. Submitting twice is harmless, because the API answers
 * a repeat with `alreadyRegistered`.
 */
export function RegistrationForm({ event, idPrefix = "register" }: { event: RegistrationEvent; idPrefix?: string }) {
  const [outcome, setOutcome] = useState<Outcome>({ kind: "form" });
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonInput, unknown, PersonBody>({
    // Checked as they go: an error on the field they just left, rather
    // than a list of them after a round trip nobody needed to spend.
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(personSchema),
    defaultValues: EMPTY_PERSON,
  });

  async function onSubmit(person: PersonBody) {
    setFormError(null);

    // The page may have been cached before the event started.
    if (hasStarted(event.startsAt)) {
      setOutcome({ kind: "closed" });
      return;
    }

    try {
      const response = await run(() => registerForEvent(event.slug, person));
      setOutcome({ kind: "registered", response });
    } catch (error) {
      const failure = describeFailure(error);
      if (failure.kind === "full" || failure.kind === "closed") setOutcome({ kind: failure.kind });
      else if (failure.kind === "message") setFormError(failure.message);
      else
        failure.fields.forEach(({ field, message }, index) => {
          if (field !== "discountCode") setError(field, { type: "server", message }, { shouldFocus: index === 0 });
        });
    }
  }

  if (outcome.kind === "registered") {
    return <Registered idPrefix={idPrefix} event={event} response={outcome.response} />;
  }
  if (outcome.kind === "full") return <RegistrationFull idPrefix={idPrefix} type={event.type} focus />;
  if (outcome.kind === "closed") return <SessionStarted idPrefix={idPrefix} event={event} focus />;

  const places = placesNote(event);

  return (
    // data-register-form: the mobile register bar is offered only while this form is.
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby={`${idPrefix}-title`}
      data-register-form
      className="flex flex-col gap-6"
    >
      <FormHead
        id={`${idPrefix}-title`}
        title="Register free"
        line="We’ll email your confirmation now and send your joining link with your reminders."
      />

      <PersonFields register={register} control={control} errors={errors} idPrefix={idPrefix} />

      <div className="flex flex-col gap-3">
        <FormAlert message={formError} />
        {places ? <p className="type-meta font-medium text-ink-muted tabular-nums">{places}</p> : null}
        <div>
          <SubmitButton busy={isSubmitting} busyLabel="Registering…">
            Register free
          </SubmitButton>
          <SlowNote show={isSubmitting && slow} />
        </div>
        <p className="type-meta font-medium text-ink-muted">Free. Nothing to pay.</p>
      </div>
    </form>
  );
}
