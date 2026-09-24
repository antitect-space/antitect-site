"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormAlert, PersonFields, SlowNote } from "@/components/forms/person-fields";
import { PlaceConfirmed, Unavailable } from "@/components/forms/outcomes";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { registerForEvent, type RegistrationResponse } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import { hasStarted } from "@/lib/format";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";

type Outcome =
  | { kind: "form" }
  | { kind: "registered"; response: RegistrationResponse }
  | { kind: "full" }
  | { kind: "closed" };

/**
 * Registration for a free event. The form never clears on a failed submit: on
 * a slow connection, retyping is where people give up. Submitting twice is
 * harmless, because the API answers a repeat with `alreadyRegistered`.
 */
export function RegistrationForm({ slug, title, startsAt }: { slug: string; title: string; startsAt: string }) {
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
    if (hasStarted(startsAt)) {
      setOutcome({ kind: "closed" });
      return;
    }

    try {
      const response = await run(() => registerForEvent(slug, person));
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
    return (
      <PlaceConfirmed
        heading={outcome.response.alreadyRegistered ? "You are already registered." : "You are registered."}
        repeat={outcome.response.alreadyRegistered}
        channel={outcome.response.channel}
        sentTo={outcome.response.sentTo}
        title={title}
        next={{ href: "/programmes", label: "See our programmes" }}
      />
    );
  }

  if (outcome.kind !== "form") {
    return (
      <Unavailable
        heading={outcome.kind === "full" ? "Every place has been taken." : "Registration has closed."}
        detail="The next event will be on our events page. Join the community and you will hear about it first."
        next={{ href: "/events", label: "See upcoming events" }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="register-title">
      <h2 id="register-title" className="text-title text-3xl">
        Register free
      </h2>
      <p className="mt-2 leading-[1.6] text-muted-foreground">We email you the details and the link to join.</p>

      <div className="mt-6">
        <PersonFields register={register} control={control} errors={errors} idPrefix="register" />
      </div>

      <FormAlert message={formError} className="mt-6" />
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registering…" : "Register free"}
      </Button>
      <SlowNote show={isSubmitting && slow} />
    </form>
  );
}
