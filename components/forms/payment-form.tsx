"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { PlaceConfirmed, Unavailable } from "@/components/forms/outcomes";
import { Field, FormAlert, PersonFields, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getQuote, startPayment, type Channel, type Payable, type Quote } from "@/lib/api";
import { describeFailure } from "@/lib/form-errors";
import { formatKobo, hasStarted } from "@/lib/format";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonInput } from "@/lib/schemas";

type Outcome =
  | { kind: "form" }
  | { kind: "redirecting" }
  | { kind: "already"; channel: Channel; sentTo: string | null }
  | { kind: "full" }
  | { kind: "closed" };

interface Props {
  payable: Payable;
  title: string;
  priceKobo: number;
  /** Past this instant the form closes itself, in case the page was cached. */
  closesAt: string | null;
}

const COPY = {
  event: {
    heading: "Reserve your place",
    freeAction: "Reserve your place",
    already: "You already have a place.",
    full: "Every place has been taken.",
    closed: "Registration has closed.",
    unavailableDetail: "The next event will be on our events page. Join the community and you will hear about it first.",
    unavailableNext: { href: "/events", label: "See upcoming events" },
    confirmedNext: { href: "/programmes", label: "See our programmes" },
  },
  program: {
    heading: "Enrol",
    freeAction: "Enrol",
    already: "You are already enrolled.",
    full: "This cohort is full.",
    closed: "Enrolment for this cohort has closed.",
    unavailableDetail: "Join the community and you will hear first when the next cohort opens.",
    unavailableNext: { href: "/community", label: "Join the community" },
    confirmedNext: { href: "/events", label: "See upcoming events" },
  },
} as const;

/**
 * Details, an optional discount code, then Paystack. Payment is confirmed by
 * the API, never by this form: a successful submit only hands the visitor to
 * Paystack, or to the return page when a code made it free. The form never
 * clears on failure.
 */
export function PaymentForm({ payable, title, priceKobo, closesAt }: Props) {
  const copy = COPY[payable.kind];
  const [outcome, setOutcome] = useState<Outcome>({ kind: "form" });
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PersonInput, unknown, PersonBody>({
    resolver: zodResolver(personSchema),
    defaultValues: EMPTY_PERSON,
  });

  const appliedCode = quote && quote.code.toLowerCase() === code.trim().toLowerCase() ? quote.code : undefined;
  const total = appliedCode && quote ? quote.totalKobo : priceKobo;

  async function applyCode() {
    const trimmed = code.trim();
    setCodeError(null);
    setQuote(null);
    if (!trimmed) {
      setCodeError("Enter a discount code.");
      return;
    }
    setQuoting(true);
    try {
      setQuote(await getQuote(payable, trimmed));
    } catch (error) {
      const failure = describeFailure(error);
      const fieldMessage = failure.kind === "fields" ? failure.fields.find((f) => f.field === "discountCode") : undefined;
      setCodeError(
        fieldMessage?.message ??
          (failure.kind === "message" ? failure.message : "That code cannot be used here."),
      );
    } finally {
      setQuoting(false);
    }
  }

  async function onSubmit(person: PersonBody) {
    setFormError(null);

    if (closesAt && hasStarted(closesAt)) {
      setOutcome({ kind: "closed" });
      return;
    }

    try {
      // An unapplied code in the box is still sent: the API is the judge, and
      // a bad one comes back as a field error without charging anything.
      const response = await run(() => startPayment(payable, person, appliedCode ?? (code.trim() || undefined)));

      if ("alreadyRegistered" in response || "alreadyEnrolled" in response) {
        setOutcome({ kind: "already", channel: response.channel, sentTo: response.sentTo });
        return;
      }

      setOutcome({ kind: "redirecting" });
      // Free after a discount: nothing to pay, and the return page reports the result.
      window.location.assign(
        response.authorizationUrl ?? `/payment/complete?reference=${encodeURIComponent(response.reference)}`,
      );
    } catch (error) {
      const failure = describeFailure(error);
      if (failure.kind === "full" || failure.kind === "closed") {
        setOutcome({ kind: failure.kind });
      } else if (failure.kind === "message") {
        setFormError(failure.message);
      } else {
        let focused = false;
        for (const { field, message } of failure.fields) {
          if (field === "discountCode") {
            setCodeOpen(true);
            setCodeError(message);
            setQuote(null);
          } else {
            setError(field, { type: "server", message }, { shouldFocus: !focused });
            focused = true;
          }
        }
      }
    }
  }

  if (outcome.kind === "already") {
    return (
      <PlaceConfirmed
        heading={copy.already}
        repeat
        channel={outcome.channel}
        sentTo={outcome.sentTo}
        title={title}
        next={copy.confirmedNext}
      />
    );
  }

  if (outcome.kind === "full" || outcome.kind === "closed") {
    return (
      <Unavailable
        heading={outcome.kind === "full" ? copy.full : copy.closed}
        detail={copy.unavailableDetail}
        next={copy.unavailableNext}
      />
    );
  }

  const busy = isSubmitting || outcome.kind === "redirecting";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="pay-title">
      <h2 id="pay-title" className="text-title text-3xl">
        {copy.heading}
      </h2>
      <p className="mt-2 leading-[1.6] text-muted-foreground">
        You pay securely on Paystack, then come back here. Your place is confirmed when payment clears.
      </p>

      <div className="mt-6">
        <PersonFields register={register} control={control} errors={errors} idPrefix={payable.kind} />
      </div>

      <details
        className="mt-6 border-t border-border pt-5"
        open={codeOpen}
        onToggle={(event) => setCodeOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-semibold underline underline-offset-4">Have a discount code?</summary>
        <div className="mt-4">
          <Field id={`${payable.kind}-discountCode`} label="Discount code" error={codeError ?? undefined}>
            <div className="flex gap-2">
              <Input
                id={`${payable.kind}-discountCode`}
                value={code}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={codeError ? true : undefined}
                aria-describedby={codeError ? `${payable.kind}-discountCode-error` : undefined}
                onChange={(event) => {
                  setCode(event.target.value);
                  setCodeError(null);
                }}
              />
              <Button type="button" variant="outline" onClick={applyCode} disabled={quoting}>
                {quoting ? "Checking…" : "Apply code"}
              </Button>
            </div>
          </Field>
          {appliedCode && quote ? (
            <p aria-live="polite" className="mt-3 font-medium">
              {quote.code} takes {formatKobo(quote.discountKobo)} off.
            </p>
          ) : null}
        </div>
      </details>

      <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-foreground pt-5">
        <span className="font-semibold">Total</span>
        <span className="text-title text-3xl">
          {appliedCode && total !== priceKobo ? (
            <>
              <s className="mr-3 text-lg font-normal text-muted-foreground">{formatKobo(priceKobo)}</s>
              {formatKobo(total)}
            </>
          ) : (
            formatKobo(total)
          )}
        </span>
      </div>

      <FormAlert message={formError} className="mt-6" />
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {outcome.kind === "redirecting"
          ? "Taking you to Paystack…"
          : isSubmitting
            ? "Starting payment…"
            : total === 0
              ? copy.freeAction
              : "Continue to payment"}
      </Button>
      <SlowNote show={isSubmitting && slow} />
    </form>
  );
}
