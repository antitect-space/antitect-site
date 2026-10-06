"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { PlaceConfirmed, Unavailable } from "@/components/forms/outcomes";
import { Field, FormAlert, PersonFields, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, getQuote, joinWaitlist, startPayment, type Channel, type Payable, type Quote } from "@/lib/api";
import { describeFailure, type FormField } from "@/lib/form-errors";
import { formatKobo, hasStarted } from "@/lib/format";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonField, type PersonInput } from "@/lib/schemas";

type Outcome =
  | { kind: "form" }
  | { kind: "redirecting" }
  | { kind: "already"; channel: Channel; sentTo: string | null }
  | { kind: "full" }
  | { kind: "closed" };

/** A programme's checkout is two steps: their details, then the discount and the total. */
type Step = "details" | "pay";

interface Props {
  payable: Payable;
  title: string;
  priceKobo: number;
  /** Past this instant the form closes itself, in case the page was cached. */
  closesAt: string | null;
  /**
   * Programmes only, with the waitlist on: the first step's Continue puts them
   * on the waitlist, so somebody who never pays is still somebody to follow up.
   */
  captureLead?: boolean;
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
    heading: "Secure your spot",
    freeAction: "Secure your spot",
    already: "You are already enrolled.",
    full: "This cohort is full.",
    closed: "Enrolment for this cohort has closed.",
    unavailableDetail: "Join the community and you will hear first when the next cohort opens.",
    unavailableNext: { href: "/community", label: "Join the community" },
    confirmedNext: { href: "/events", label: "See upcoming events" },
  },
} as const;

/** Who has been put on the waitlist from this form, so going back and forth asks once. */
function leadKey(person: PersonBody): string {
  return `${person.email}|${person.phone}`;
}

/**
 * Details, an optional discount code, then Paystack. Payment is confirmed by
 * the API, never by this form: a successful submit only hands the visitor to
 * Paystack, or to the return page when a code made it free. The form never
 * clears on failure.
 *
 * An event asks for all of it at once. A programme asks in two steps, details
 * and then the total, and with `captureLead` the first step's Continue puts
 * them on the waitlist. That never stands between somebody and paying: only
 * what enrolment would refuse as well stops them there.
 */
export function PaymentForm({ payable, title, priceKobo, closesAt, captureLead = false }: Props) {
  const copy = COPY[payable.kind];
  const twoStep = payable.kind === "program";
  const [outcome, setOutcome] = useState<Outcome>({ kind: "form" });
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const [step, setStep] = useState<Step>("details");
  const [person, setPerson] = useState<PersonBody | null>(null);
  const [joinedFor, setJoinedFor] = useState<string | null>(null);
  // Where focus goes once a step is drawn. A new object each time, so asking twice still moves it.
  const [focusRequest, setFocusRequest] = useState<{ target: Step | PersonField } | null>(null);
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  const payHeading = useRef<HTMLHeadingElement>(null);

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
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<PersonInput, unknown, PersonBody>({
    // Checked as they go: an error on the field they just left, rather
    // than a list of them after a round trip nobody needed to spend.
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(personSchema),
    defaultValues: EMPTY_PERSON,
  });

  useEffect(() => {
    if (!focusRequest) return;
    const { target } = focusRequest;
    if (target === "pay") payHeading.current?.focus();
    else if (target === "details") detailsHeading.current?.focus();
    else setFocus(target);
  }, [focusRequest, setFocus]);

  function goTo(next: Step, focus: Step | PersonField = next) {
    setFocusRequest({ target: focus });
    setStep(next);
  }

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

  /** Puts the API's words back on the fields they belong to. Returns the first person field, if any. */
  function showFieldErrors(fields: Array<{ field: FormField; message: string }>, focus: boolean): PersonField | null {
    let first: PersonField | null = null;
    for (const { field, message } of fields) {
      if (field === "discountCode") {
        setCodeOpen(true);
        setCodeError(message);
        setQuote(null);
      } else {
        setError(field, { type: "server", message }, { shouldFocus: focus && first === null });
        first ??= field;
      }
    }
    return first;
  }

  /** A programme's first step: on to the total, joining the waitlist on the way when it is on. */
  async function onContinue(details: PersonBody) {
    setFormError(null);

    if (closesAt && hasStarted(closesAt)) {
      setOutcome({ kind: "closed" });
      return;
    }

    if (captureLead && joinedFor !== leadKey(details)) {
      try {
        await run(() => joinWaitlist(payable.slug, details));
        setJoinedFor(leadKey(details));
      } catch (error) {
        // Only what enrolment would refuse too is worth stopping for. A closed
        // waitlist, a busy connection or anything else is no reason not to pay.
        const failure = describeFailure(error);
        if (failure.kind === "fields") {
          showFieldErrors(failure.fields, true);
          return;
        }
        if (error instanceof ApiError && error.code === "CONTACT_CONFLICT" && failure.kind === "message") {
          setFormError(failure.message);
          return;
        }
      }
    }

    setPerson(details);
    goTo("pay");
  }

  async function pay(details: PersonBody) {
    setFormError(null);

    if (closesAt && hasStarted(closesAt)) {
      setOutcome({ kind: "closed" });
      return;
    }

    try {
      // An unapplied code in the box is still sent: the API is the judge, and
      // a bad one comes back as a field error without charging anything.
      const response = await run(() => startPayment(payable, details, appliedCode ?? (code.trim() || undefined)));

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
        // On a programme the details are a step back: go there, to the first one wrong.
        const first = showFieldErrors(failure.fields, !twoStep);
        if (twoStep && first) goTo("details", first);
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

  const intro = (
    <p className="mt-2 leading-[1.6] text-muted-foreground">
      You pay securely on Paystack, then come back here. Your place is confirmed when payment clears.
    </p>
  );

  const fields = (
    <div className="mt-6">
      <PersonFields register={register} control={control} errors={errors} idPrefix={payable.kind} />
    </div>
  );

  const discount = (
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
  );

  const totalLine = (
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
  );

  const payButton = (
    <>
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
    </>
  );

  if (!twoStep) {
    return (
      <form onSubmit={handleSubmit(pay)} noValidate aria-labelledby="pay-title">
        <h2 id="pay-title" className="text-title text-3xl">
          {copy.heading}
        </h2>
        {intro}
        {fields}
        {discount}
        {totalLine}
        {payButton}
      </form>
    );
  }

  return (
    <>
      {/* Hidden rather than removed on the second step, so the details and any errors on them are kept. */}
      <form onSubmit={handleSubmit(onContinue)} noValidate aria-labelledby="pay-title" hidden={step !== "details"}>
        <h2 id="pay-title" ref={detailsHeading} tabIndex={-1} className="text-title text-3xl outline-none">
          {copy.heading}
        </h2>
        {intro}
        {fields}
        <FormAlert message={step === "details" ? formError : null} className="mt-6" />
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Continuing…" : "Continue"}
        </Button>
        <SlowNote show={step === "details" && isSubmitting && slow} />
      </form>

      {step === "pay" && person ? (
        <form onSubmit={handleSubmit(pay)} noValidate aria-labelledby="pay-total-title">
          <h2 id="pay-total-title" ref={payHeading} tabIndex={-1} className="text-title text-3xl outline-none">
            {copy.heading}
          </h2>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 bg-muted px-4 py-3">
            <p className="min-w-0 leading-[1.5] break-words">
              <span className="font-semibold">{[person.firstName, person.lastName].filter(Boolean).join(" ")}</span>
              <br />
              {person.email}
              <br />
              {person.phone}
            </p>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                goTo("details");
              }}
              className="font-semibold underline underline-offset-4 hover:no-underline"
            >
              Change details
            </button>
          </div>
          {discount}
          {totalLine}
          {payButton}
        </form>
      ) : null}
    </>
  );
}
