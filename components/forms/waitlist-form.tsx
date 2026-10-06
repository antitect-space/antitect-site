"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { OnWaitlist } from "@/components/forms/outcomes";
import { FormAlert, PersonFields, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { joinWaitlist, type WaitlistResponse } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import type { WaitlistWording } from "@/lib/programs";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";
import { communityLink } from "@/lib/site";

const COPY: Record<WaitlistWording, { heading: string; lead: string }> = {
  join: {
    heading: "Join the waitlist",
    lead: "Leave your details and you will hear first when enrolment opens.",
  },
  next: {
    heading: "Join the waitlist for the next cohort",
    lead: "Leave your details and you will hear when the next one opens.",
  },
};

/**
 * Interest in a programme, with no payment and no place held, where paying
 * is not on offer: a draft, or a run that is full or closed. The heading is
 * worded for which; the button always joins the waitlist.
 *
 * The form never clears on a failed submit, and submitting twice is harmless:
 * the API answers a repeat with `alreadyOnWaitlist`. When the waitlist turns
 * out to be closed, the page was older than the change; `onClosed` lets the
 * panel find out where the programme stands now.
 */
export function WaitlistForm({
  slug,
  title,
  wording,
  onClosed,
}: {
  slug: string;
  title: string;
  wording: WaitlistWording;
  onClosed: () => void;
}) {
  const copy = COPY[wording];
  const [joined, setJoined] = useState<WaitlistResponse | null>(null);
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
    try {
      setJoined(await run(() => joinWaitlist(slug, person)));
    } catch (error) {
      const failure = describeFailure(error);
      if (failure.kind === "closed" || failure.kind === "full") onClosed();
      else if (failure.kind === "message") setFormError(failure.message);
      else
        failure.fields.forEach(({ field, message }, index) => {
          if (field !== "discountCode") setError(field, { type: "server", message }, { shouldFocus: index === 0 });
        });
    }
  }

  if (joined) {
    return (
      <OnWaitlist
        response={joined}
        title={title}
        next={{ href: "/events", label: "See upcoming events" }}
        community={communityLink()}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="waitlist-title">
      <h2 id="waitlist-title" className="text-title text-3xl">
        {copy.heading}
      </h2>
      <p className="mt-2 leading-[1.6] text-muted-foreground">
        {copy.lead} No payment, and no place held.
      </p>

      <div className="mt-6">
        <PersonFields
          register={register}
          control={control}
          errors={errors}
          idPrefix="waitlist"
          consentLabel={`You can message me on WhatsApp about ${title}`}
        />
      </div>

      <FormAlert message={formError} className="mt-6" />
      {/* "Join waitlist" whichever heading led here: what the button does is the same. */}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join waitlist"}
      </Button>
      <SlowNote show={isSubmitting && slow} />
    </form>
  );
}
