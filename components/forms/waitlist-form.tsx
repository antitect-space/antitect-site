"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FormAlert, FormHead, SlowNote, SubmitButton } from "@/components/forms/fields";
import { PersonFields } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { joinWaitlist, type WaitlistResponse } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";
import { communityLink } from "@/lib/site";

/**
 * Interest in a programme, with no payment and no place held, where paying
 * is not on offer: a draft, or a run that is full or closed (design C6,
 * "waitlist", "full-waitlist" and "closed-waitlist"). The panel words the
 * heading for which; the button always joins the waitlist.
 *
 * The form never clears on a failed submit, and submitting twice is harmless:
 * the API answers a repeat with `alreadyOnWaitlist`. When the waitlist turns
 * out to be closed, the page was older than the change; `onClosed` lets the
 * panel find out where the programme stands now.
 */
export function WaitlistForm({
  slug,
  title,
  heading,
  line,
  idPrefix = "waitlist",
  onClosed,
}: {
  slug: string;
  title: string;
  heading: string;
  line?: string;
  idPrefix?: string;
  onClosed: () => void;
}) {
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

  if (joined) return <OnWaitlist idPrefix={idPrefix} response={joined} title={title} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby={`${idPrefix}-title`}
      className="flex flex-col gap-6"
    >
      <FormHead id={`${idPrefix}-title`} title={heading} line={line} />
      <PersonFields register={register} control={control} errors={errors} idPrefix={idPrefix} />
      <div className="flex flex-col gap-3">
        <FormAlert message={formError} />
        <div>
          <SubmitButton busy={isSubmitting} busyLabel="Joining…">
            Join the waitlist
          </SubmitButton>
          <SlowNote show={isSubmitting && slow} />
        </div>
      </div>
    </form>
  );
}

/**
 * On the waitlist, which is for the programme rather than this run. All three
 * answers are a success. Only a new place on the list sends anything, so the
 * other two say nothing about an inbox. The form's red button has gone, so
 * the community invite takes its place.
 */
function OnWaitlist({ idPrefix, response, title }: { idPrefix: string; response: WaitlistResponse; title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { alreadyEnrolled, alreadyOnWaitlist, sentTo } = response;
  const sent = !alreadyEnrolled && !alreadyOnWaitlist && sentTo !== null;
  const community = communityLink();

  const heading = alreadyEnrolled
    ? `You already have a place on ${title}.`
    : alreadyOnWaitlist
      ? `You’re already on the waitlist for ${title}.`
      : `You’re on the waitlist for ${title}.`;
  const line = sent ? `We’ve sent a confirmation to ${sentTo}.` : alreadyEnrolled ? null : "We’ll be in touch.";

  return (
    <div role="status" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <FormHead id={`${idPrefix}-title`} headingRef={headingRef} title={heading} />
        {line ? <p className="type-body text-ink">{line}</p> : null}
      </div>
      <Button asChild size="lg" className="w-full px-5">
        <a href={community.href} target="_blank" rel="noopener noreferrer">
          {community.label}
        </a>
      </Button>
    </div>
  );
}
