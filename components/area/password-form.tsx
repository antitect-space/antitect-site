"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, type FieldError } from "react-hook-form";

import { FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { PasswordField } from "@/components/area/password-field";
import { Button } from "@/components/ui/button";
import { areaPost } from "@/lib/area-client";
import { AREA_HOME, type AreaName } from "@/lib/area-view";
import { describeAreaFailure } from "@/lib/area-errors";
import { PASSWORD_HINT, passwordSchema, type PasswordInput } from "@/lib/area-schemas";

/**
 * Setting a password: from an invitation, or from a reset link. The same form
 * either way, because it is the same act — the difference is only which
 * endpoint accepts the token, and what to do when the token is spent.
 *
 * The token is never shown and never editable. It came from the link.
 */
export function PasswordForm({
  area,
  token,
  purpose,
}: {
  area: AreaName;
  token: string;
  purpose: "invite" | "reset";
}) {
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  /** What the API said about the password, when it disagrees with the check here. */
  const [refused, setRefused] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PasswordInput>({
    // Checked as they go: an error on the field they just left, rather
    // than a list of them after a round trip nobody needed to spend.
    mode: "onTouched",
    reValidateMode: "onChange",
    // Every failing rule, not just the first: a password can be too short and
    // miss a number and miss a symbol, and finding that out one attempt at a
    // time is miserable.
    criteriaMode: "all",
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit({ password }: PasswordInput) {
    setFormError(null);
    setRefused([]);
    try {
      await run(() =>
        areaPost(area, purpose === "invite" ? "auth/accept-invite" : "auth/reset", { token, password }),
      );
      // Replaced, not pushed: the link in the email is spent, and Back should
      // not return to a form that can no longer be submitted.
      router.replace(AREA_HOME[area]);
      router.refresh();
    } catch (error) {
      const failure = describeAreaFailure(error);
      // The API owns the password rules, so whatever it says about one goes
      // on the field itself rather than being summarised above the button.
      const rules =
        failure.kind === "fields"
          ? failure.fields.filter((f) => f.field === "password").map((f) => f.message)
          : [];
      if (failure.kind === "expired") {
        setExpired(true);
      } else if (rules.length > 0) {
        // Shown as the API worded them. If these ever differ from the check
        // above, the copy of the rule in area-schemas has drifted.
        setRefused(rules);
        setError("password", { type: "server" }, { shouldFocus: true });
      } else {
        setFormError(
          failure.kind === "message" ? failure.message : "Check that password and try again.",
        );
      }
    }
  }

  if (expired)
    return purpose === "invite" ? (
      <ExpiredInvite area={area} token={token} />
    ) : (
      <ExpiredReset area={area} />
    );

  const busy = isSubmitting || (isSubmitSuccessful && !formError);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Set your password">
      <PasswordField
        id="learn-new-password"
        label="Choose a password"
        hint={PASSWORD_HINT}
        autoComplete="new-password"
        error={refused.length > 0 ? refused : unmet(errors.password)}
        registration={register("password", {
          // Our own check takes over again the moment they edit it.
          onChange: () => {
            if (refused.length > 0) setRefused([]);
          },
        })}
      />

      <FormAlert message={formError} className="mt-6" />

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? "Saving…" : purpose === "invite" ? "Set password and sign in" : "Save and sign in"}
      </Button>
      <SlowNote show={busy && slow} />
    </form>
  );
}

/**
 * Every rule this password fails, in the order they are checked.
 *
 * With `criteriaMode: "all"` react-hook-form collects them under `types`,
 * keyed by rule; without it there is one message. Both shapes arrive here.
 */
function unmet(error: FieldError | undefined): string[] {
  if (!error) return [];

  const all: string[] = [];
  for (const message of Object.values(error.types ?? {})) {
    if (typeof message === "string") all.push(message);
    else if (Array.isArray(message)) all.push(...message.filter((m) => typeof m === "string"));
  }

  if (all.length > 0) return all;
  return typeof error.message === "string" && error.message ? [error.message] : [];
}

/**
 * A spent invitation.
 *
 * One button, and deliberately no email field: the new link goes to the
 * address already on file. Letting somebody type an address here would turn
 * this page into a way of asking whether a given person is enrolled.
 */
function ExpiredInvite({ area, token }: { area: AreaName; token: string }) {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();
  const [sending, setSending] = useState(false);
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  async function resend() {
    setFormError(null);
    setSending(true);
    try {
      await run(() => areaPost(area, "auth/resend-invite", { token }));
      setSent(true);
    } catch (error) {
      const failure = describeAreaFailure(error);
      setFormError(
        failure.kind === "message"
          ? failure.message
          : "We could not send a new link. Write to us and we will sort it out.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div role="status">
      <p ref={headingRef} tabIndex={-1} className="text-title text-2xl outline-none">
        {sent ? "A new link is on its way." : "This link has expired."}
      </p>
      <p className="mt-3 leading-[1.6] text-muted-foreground">
        {sent
          ? "It has gone to the email address on your enrolment, and is good for seven days."
          : "Invitations are good for seven days. We can send a new one to the email address on your enrolment."}
      </p>

      {sent ? null : (
        <>
          <FormAlert message={formError} className="mt-6" />
          <Button type="button" size="lg" className="mt-6 w-full" onClick={resend} disabled={sending}>
            {sending ? "Sending…" : "Send me a new link"}
          </Button>
          <SlowNote show={sending && slow} />
        </>
      )}
    </div>
  );
}

function ExpiredReset({ area }: { area: AreaName }) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="status">
      <p ref={headingRef} tabIndex={-1} className="text-title text-2xl outline-none">
        This link has expired.
      </p>
      <p className="mt-3 leading-[1.6] text-muted-foreground">
        Reset links last an hour, and can only be used once. Ask for another and it will be with you in
        a moment.
      </p>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href={`${AREA_HOME[area]}/forgot`}>Ask for a new link</Link>
      </Button>
    </div>
  );
}
