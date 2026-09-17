"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FormAlert, PersonFields, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { joinCommunity } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";
import { communityLink } from "@/lib/site";

/**
 * Saves the person to the CRM, then hands them the WhatsApp community. For
 * everyone not ready for a webinar or a programme yet: without this they leave
 * and do not come back.
 */
export function CommunityForm({ idPrefix = "community" }: { idPrefix?: string }) {
  const [joined, setJoined] = useState<null | { alreadyMember: boolean }>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonInput, unknown, PersonBody>({
    resolver: zodResolver(personSchema),
    defaultValues: EMPTY_PERSON,
  });

  async function onSubmit(person: PersonBody) {
    setFormError(null);
    try {
      setJoined(await run(() => joinCommunity(person)));
    } catch (error) {
      const failure = describeFailure(error);
      if (failure.kind === "fields") {
        failure.fields.forEach(({ field, message }, index) => {
          if (field !== "discountCode") setError(field, { type: "server", message }, { shouldFocus: index === 0 });
        });
      } else {
        setFormError(failure.kind === "message" ? failure.message : "We could not add you just now. Try again in a moment.");
      }
    }
  }

  if (joined) return <Joined alreadyMember={joined.alreadyMember} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Join the community">
      <PersonFields
        register={register}
        errors={errors}
        idPrefix={idPrefix}
        consentLabel="You can message me on WhatsApp about Antitect"
      />
      <FormAlert message={formError} className="mt-6" />
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join the community"}
      </Button>
      <SlowNote show={isSubmitting && slow} />
    </form>
  );
}

function Joined({ alreadyMember }: { alreadyMember: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const link = communityLink();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="status">
      <h3 ref={headingRef} tabIndex={-1} className="text-title text-3xl outline-none">
        You are in.
      </h3>
      <p className="mt-4 text-lg leading-[1.6]">
        {alreadyMember
          ? "You were already on our list, so nothing changes. You will keep hearing about webinars before they are announced publicly."
          : "You will hear about webinars before they are announced publicly. The conversation happens on WhatsApp."}
      </p>
      <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
        <a href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      </Button>
    </div>
  );
}
