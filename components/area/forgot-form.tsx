"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Field, FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { areaPost } from "@/lib/area-client";
import { AREA_HOME, type AreaName } from "@/lib/area-view";
import { describeAreaFailure } from "@/lib/area-errors";
import { forgotSchema, type ForgotInput } from "@/lib/area-schemas";

/**
 * Asking for a new password.
 *
 * The answer is the same whether or not that address has an account, because
 * anything else would tell a stranger who is enrolled. The API answers 200
 * either way; this page says the same thing either way.
 */
export function ForgotForm({ area }: { area: AreaName }) {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotInput>({
    // Checked as they go: an error on the field they just left, rather
    // than a list of them after a round trip nobody needed to spend.
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotInput) {
    setFormError(null);
    try {
      await run(() => areaPost(area, "auth/forgot", values));
      setSent(true);
    } catch (error) {
      const failure = describeAreaFailure(error);
      const emailError = failure.kind === "fields" && failure.fields.find((f) => f.field === "email");
      if (emailError) {
        setError("email", { type: "server", message: emailError.message }, { shouldFocus: true });
      } else {
        setFormError(
          failure.kind === "message" ? failure.message : "We could not send that just now. Try again in a moment.",
        );
      }
    }
  }

  if (sent) return <Sent area={area} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Reset your password">
      <Field id="forgot-email" label="Email address" error={errors.email?.message}>
        <Input
          id="forgot-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "forgot-email-error" : undefined}
          {...register("email")}
        />
      </Field>

      <FormAlert message={formError} className="mt-6" />

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send me a link"}
      </Button>
      <SlowNote show={isSubmitting && slow} />
    </form>
  );
}

function Sent({ area }: { area: AreaName }) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="status">
      <p ref={headingRef} tabIndex={-1} className="text-title text-2xl outline-none">
        Check your email.
      </p>
      <p className="mt-3 leading-[1.6] text-muted-foreground">
        If that address has an account, a link to set a new password is on its way. It is good for an
        hour.
      </p>
      <p className="mt-5 text-[0.9375rem]">
        <Link href={`${AREA_HOME[area]}/login`} className="underline underline-offset-4 hover:no-underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
