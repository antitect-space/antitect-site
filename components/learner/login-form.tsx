"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Field, FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { PasswordField } from "@/components/learner/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { learnerPost, safeNext } from "@/lib/learner-client";
import { describeLearnerFailure } from "@/lib/learner-errors";
import { loginSchema, type LoginInput } from "@/lib/learner-schemas";

/**
 * Signing in. The password goes to this site, which forwards it, and the
 * session comes back as a cookie no script here can read.
 *
 * On success it replaces this page rather than pushing over it, so Back does
 * not land on a sign-in form somebody has already used, and refreshes so the
 * server renders the next page with the session it has just been given.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      await run(() => learnerPost("auth/login", values));
      router.replace(safeNext(next));
      router.refresh();
    } catch (error) {
      const failure = describeLearnerFailure(error);
      if (failure.kind === "fields") {
        failure.fields.forEach(({ field, message }, index) =>
          setError(field, { type: "server", message }, { shouldFocus: index === 0 }),
        );
      } else {
        setFormError(
          failure.kind === "message" ? failure.message : "That link has expired. Ask for a new one below.",
        );
      }
    }
  }

  // The redirect is under way; the button must not invite a second attempt.
  const busy = isSubmitting || (isSubmitSuccessful && !formError);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Sign in">
      <div className="grid gap-5">
        <Field id="learn-email" label="Email address" error={errors.email?.message}>
          <Input
            id="learn-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "learn-email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <PasswordField
          id="learn-password"
          label="Password"
          autoComplete="current-password"
          error={errors.password?.message}
          registration={register("password")}
        />
      </div>

      <FormAlert message={formError} className="mt-6" />

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <SlowNote show={busy && slow} />

      <p className="mt-5 text-[0.9375rem]">
        <Link href="/learn/forgot" className="underline underline-offset-4 hover:no-underline">
          Forgotten your password?
        </Link>
      </p>
    </form>
  );
}
