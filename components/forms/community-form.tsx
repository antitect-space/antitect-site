"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { FormAlert, SlowNote, SubmitButton } from "@/components/forms/fields";
import { PersonFields } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { joinCommunity } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";
import { communityLink } from "@/lib/site";

type Variant = "page" | "inline";

const COPY: Record<Variant, { consent: string }> = {
  page: { consent: "You can message me on WhatsApp about Antitect" },
  inline: { consent: "You can message me on WhatsApp about new sessions" },
};

/**
 * Saves the person to the CRM, then hands them the WhatsApp community. For
 * everyone not ready for a webinar or a programme yet: without this they leave
 * and do not come back.
 *
 * `inline` is the design's W6: it sits under a heading its container
 * supplies (a panel, a side card, an empty listing), says it is free, and
 * swaps itself for "You’re in." once they have joined. `page` is the
 * community page's form.
 */
export function CommunityForm({
  idPrefix = "community",
  variant = "page",
  defaults,
  onJoined,
}: {
  idPrefix?: string;
  variant?: Variant;
  /** Details already typed elsewhere on the page, such as a refused reservation, so nobody types them twice. */
  defaults?: Partial<PersonInput>;
  /** Lets the container drop its own invitation to join once somebody has. */
  onJoined?: () => void;
}) {
  const [joined, setJoined] = useState<null | { alreadyMember: boolean }>(null);
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
    defaultValues: { ...EMPTY_PERSON, ...defaults },
  });

  async function onSubmit(person: PersonBody) {
    setFormError(null);
    try {
      setJoined(await run(() => joinCommunity(person)));
      onJoined?.();
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

  if (joined) return <Joined variant={variant} alreadyMember={joined.alreadyMember} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Join the community" className="flex flex-col gap-6">
      <PersonFields
        register={register}
        control={control}
        errors={errors}
        idPrefix={idPrefix}
        consentLabel={COPY[variant].consent}
      />
      <div className="flex flex-col gap-3">
        <FormAlert message={formError} />
        <div>
          <SubmitButton busy={isSubmitting} busyLabel="Joining…">
            Join the community
          </SubmitButton>
          <SlowNote show={isSubmitting && slow} />
        </div>
        {variant === "inline" ? <p className="type-meta font-medium text-ink-muted">Free · Leave any time</p> : null}
      </div>
    </form>
  );
}

function Joined({ variant, alreadyMember }: { variant: Variant; alreadyMember: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const link = communityLink();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const line =
    variant === "inline"
      ? "Join the WhatsApp community to hear about new sessions first."
      : alreadyMember
        ? "You were already on our list, so nothing changes. You’ll keep hearing about webinars before they’re announced publicly."
        : "You’ll hear about webinars before they’re announced publicly. The conversation happens on WhatsApp.";

  return (
    <div role="status" className="flex flex-col gap-4">
      <h3 ref={headingRef} tabIndex={-1} className="type-h3 text-ink outline-none">
        You’re in.
      </h3>
      <p className="type-body text-ink-muted">{line}</p>
      <div className="pt-2">
        <Button asChild size="lg" className="w-full px-5">
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </Button>
      </div>
    </div>
  );
}
