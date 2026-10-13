"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";

import { Field, FormAlert, FormHead, SlowNote, SubmitButton, TextInput } from "@/components/forms/fields";
import { PersonFields } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { ChevronDown, Tick } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ApiError, getQuote, joinWaitlist, startPayment, type Payable, type Quote } from "@/lib/api";
import { describeFailure, type FormField } from "@/lib/form-errors";
import { formatKobo, hasStarted } from "@/lib/format";
import { EMPTY_PERSON, personSchema, type PersonBody, type PersonField, type PersonInput } from "@/lib/schemas";

type Outcome =
  | { kind: "form" }
  | { kind: "redirecting" }
  | { kind: "already"; sentTo: string | null }
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
  /** "4 places left", shown above the button when few remain; null otherwise. */
  places?: string | null;
  /** Used for the form's ids, so two forms can share a page. */
  idPrefix?: string;
  /** What it is, for sentences such as "The price of this workshop has changed." */
  noun?: string;
  /**
   * The API refused the place: every one has gone, or it has closed (the
   * event started, or enrolment ended, after the page was cached). The panel
   * shows what fits instead of the form; without this the form says so itself.
   */
  onRefused?: (kind: "full" | "closed", person: PersonBody) => void;
}

const COPY = {
  event: {
    heading: "Reserve your place",
    freeAction: "Reserve your place",
    freeBusy: "Reserving your place…",
    already: "You already have a place.",
    alreadyWhen: "when you reserved it",
    full: "Every place has been taken.",
    closed: "Reservations have closed.",
  },
  program: {
    heading: "Secure your place",
    freeAction: "Secure your place",
    freeBusy: "Securing your place…",
    already: "You’re already enrolled.",
    alreadyWhen: "when you enrolled",
    full: "This cohort is full.",
    closed: "Enrolment for this cohort has closed.",
  },
} as const;

const PAYSTACK_LINE = "You pay securely on Paystack, then come back here. Your place is confirmed when payment clears.";

/** Who has been put on the waitlist from this form, so going back and forth asks once. */
function leadKey(person: PersonBody): string {
  return `${person.email}|${person.phone}`;
}

/**
 * The reservation and enrolment form (design C7 and C6): details, an
 * optional discount code, the total, then Paystack. Payment is confirmed by
 * the API, never by this form: a successful submit only hands the visitor to
 * Paystack, or to the return page when a code made it free. The form never
 * clears on failure.
 *
 * An event asks for all of it at once. A programme asks in two steps, details
 * and then the total, and with `captureLead` the first step's Continue puts
 * them on the waitlist. That never stands between somebody and paying: only
 * what enrolment would refuse as well stops them there.
 */
export function PaymentForm({
  payable,
  title,
  priceKobo,
  closesAt,
  captureLead = false,
  places = null,
  idPrefix = payable.kind,
  noun = payable.kind === "event" ? "event" : "programme",
  onRefused,
}: Props) {
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

  function refuse(kind: "full" | "closed", details: PersonBody) {
    if (onRefused) onRefused(kind, details);
    else setOutcome({ kind });
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
      refuse("closed", details);
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
      refuse("closed", details);
      return;
    }

    try {
      // An unapplied code in the box is still sent: the API is the judge, and
      // a bad one comes back as a field error without charging anything.
      const response = await run(() => startPayment(payable, details, appliedCode ?? (code.trim() || undefined)));

      if ("alreadyRegistered" in response || "alreadyEnrolled" in response) {
        setOutcome({ kind: "already", sentTo: response.sentTo });
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
        refuse(failure.kind, details);
      } else if (error instanceof ApiError && (error.code === "PAYMENT_REQUIRED" || error.code === "PAYMENT_NOT_REQUIRED")) {
        setFormError(`The price of this ${noun} has changed. Reload the page to continue.`);
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
      <AlreadyHave
        id={`${idPrefix}-title`}
        heading={copy.already}
        line={outcome.sentTo ? `We sent the details to ${outcome.sentTo} ${copy.alreadyWhen}.` : `Your place for ${title} is saved.`}
      />
    );
  }

  if (outcome.kind === "full" || outcome.kind === "closed") {
    return (
      <div role="status" className="flex flex-col gap-4">
        <FormHead
          id={`${idPrefix}-title`}
          title={outcome.kind === "full" ? copy.full : copy.closed}
          line="Join the community and you’ll hear first when the next one opens."
        />
        <div className="pt-2">
          <Button asChild size="lg" className="w-full px-5">
            <Link href="/community">Join the community</Link>
          </Button>
        </div>
      </div>
    );
  }

  const busy = isSubmitting || outcome.kind === "redirecting";
  const free = total === 0;
  const codeId = `${idPrefix}-discountCode`;

  const discount = (
    <details className="group" open={codeOpen} onToggle={(event) => setCodeOpen(event.currentTarget.open)}>
      <summary className="flex h-11 w-fit cursor-pointer list-none items-center gap-2 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
        Have a discount code?
        <ChevronDown className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="flex flex-col pt-3">
        <Field id={codeId} label="Discount code" error={codeError ?? undefined}>
          <div className="flex gap-2">
            <TextInput
              id={codeId}
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={codeError ? true : undefined}
              aria-describedby={codeError ? `${codeId}-error` : undefined}
              onChange={(event) => {
                setCode(event.target.value);
                setCodeError(null);
              }}
            />
            {/* Busy, it refuses a second check rather than being disabled, so focus stays on it. */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="px-5"
              aria-disabled={quoting || undefined}
              onClick={quoting ? undefined : applyCode}
            >
              {quoting ? "Checking…" : "Apply code"}
            </Button>
          </div>
        </Field>
        {/* Always present, so the discount is announced when it arrives. */}
        <div aria-live="polite">
          {appliedCode && quote ? (
            <p className="type-small mt-3 flex items-center gap-2 font-semibold text-ink tabular-nums">
              <Tick />
              Code applied: −{formatKobo(quote.discountKobo)}
            </p>
          ) : null}
        </div>
      </div>
    </details>
  );

  const discounted = Boolean(appliedCode) && total !== priceKobo;
  const totalRow = (
    <div className="flex items-end justify-between gap-4 border-b border-ink pb-3">
      <span className="type-body font-semibold text-ink">Total</span>
      <span className="flex flex-wrap items-baseline justify-end gap-x-3 tabular-nums">
        {discounted ? (
          <s className="type-body text-ink-muted">
            <span className="sr-only">Was </span>
            {formatKobo(priceKobo)}
          </s>
        ) : null}
        <span className="type-h3 text-ink">
          {discounted ? <span className="sr-only">Now </span> : null}
          {formatKobo(total)}
        </span>
      </span>
    </div>
  );

  /** The alert, the places left, the button and the slow note. `active` is false on a hidden step. */
  const submit = (label: string, busyLabel: string, active: boolean) => (
    <div className="flex flex-col gap-3">
      <FormAlert message={active ? formError : null} />
      {places ? <p className="type-meta font-medium text-ink-muted tabular-nums">{places}</p> : null}
      <div>
        <SubmitButton busy={busy && active} busyLabel={busyLabel}>
          {label}
        </SubmitButton>
        <SlowNote show={active && isSubmitting && slow} />
      </div>
    </div>
  );
  const paySubmit = submit(
    free ? copy.freeAction : "Continue to payment",
    free ? copy.freeBusy : "Taking you to Paystack…",
    true,
  );

  if (!twoStep) {
    return (
      <form
        onSubmit={handleSubmit(pay)}
        noValidate
        data-register-form
        aria-labelledby={`${idPrefix}-title`}
        className="flex flex-col gap-6"
      >
        <FormHead id={`${idPrefix}-title`} title={copy.heading} line={PAYSTACK_LINE} />
        <div className="flex flex-col gap-5">
          <PersonFields register={register} control={control} errors={errors} idPrefix={idPrefix} />
          {discount}
          {totalRow}
        </div>
        {paySubmit}
      </form>
    );
  }

  return (
    <>
      {/* Hidden rather than removed on the second step, so the details and any errors on them are kept. */}
      <form
        onSubmit={handleSubmit(onContinue)}
        noValidate
        data-register-form
        aria-labelledby={`${idPrefix}-title`}
        hidden={step !== "details"}
        className="flex flex-col gap-6"
      >
        <FormHead id={`${idPrefix}-title`} headingRef={detailsHeading} title={copy.heading} line={PAYSTACK_LINE} />
        <PersonFields register={register} control={control} errors={errors} idPrefix={idPrefix} />
        {submit("Continue", "Continuing…", step === "details")}
      </form>

      {step === "pay" && person ? (
        <form
          onSubmit={handleSubmit(pay)}
          noValidate
          data-register-form
          aria-labelledby={`${idPrefix}-total-title`}
          className="flex flex-col gap-6"
        >
          <FormHead id={`${idPrefix}-total-title`} headingRef={payHeading} title={copy.heading} />
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 rounded-md bg-wash py-3.5 pr-3 pl-4">
              <p className="type-body flex min-w-0 flex-col">
                <span className="font-semibold text-ink">
                  {[person.firstName, person.lastName].filter(Boolean).join(" ")}
                </span>
                <span className="break-words text-ink-muted">{person.email}</span>
              </p>
              <Button
                type="button"
                variant="text"
                className="px-1"
                aria-label="Change your details"
                onClick={() => {
                  setFormError(null);
                  goTo("details");
                }}
              >
                Change
              </Button>
            </div>
            {discount}
            {totalRow}
          </div>
          {paySubmit}
        </form>
      ) : null}
    </>
  );
}

/** They hold a place already. Nothing new was sent, so nothing points at an inbox. */
function AlreadyHave({ id, heading, line }: { id: string; heading: string; line: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  return (
    <div role="status" className="flex flex-col gap-2">
      <FormHead id={id} headingRef={headingRef} title={heading} />
      <p className="type-body text-ink">{line}</p>
    </div>
  );
}
