"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, getPaymentStatus, isValidReference, type PaymentStatus as Status } from "@/lib/api";
import { formatDay } from "@/lib/format";
import { CONTACT } from "@/lib/site";

const POLL_EVERY_MS = 2_000;
const MAX_POLLS = 15;

type Phase =
  | { kind: "checking" }
  | { kind: "settled"; status: Status }
  | { kind: "waiting" }
  | { kind: "not-found" };

/**
 * The Paystack return page. Arriving here proves nothing: anyone can open this
 * URL, and a genuine payer can lose connection before it loads. So it always
 * starts by checking, and only the API's answer moves it on. Success is never
 * shown on arrival.
 */
export function PaymentStatus({ reference }: { reference: string | null }) {
  const valid = reference !== null && isValidReference(reference);
  const [phase, setPhase] = useState<Phase>(valid ? { kind: "checking" } : { kind: "not-found" });
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!valid || !reference) return;
    const ref = reference;

    let polls = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function poll() {
      polls += 1;
      try {
        const status = await getPaymentStatus(ref);
        if (stopped) return;
        if (status.status !== "pending") {
          setPhase({ kind: "settled", status });
          return;
        }
      } catch (error) {
        if (stopped) return;
        if (error instanceof ApiError && error.status === 404) {
          setPhase({ kind: "not-found" });
          return;
        }
        // A dropped connection or a slow API: keep trying within the window.
      }
      if (polls >= MAX_POLLS) setPhase({ kind: "waiting" });
      else timer = setTimeout(poll, POLL_EVERY_MS);
    }

    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reference, valid]);

  useEffect(() => {
    if (phase.kind !== "checking") headingRef.current?.focus();
  }, [phase.kind]);

  const refLine = valid ? (
    <>
      {" "}
      Your reference is <span className="font-semibold break-all text-foreground">{reference}</span>.
    </>
  ) : null;

  const contact = (
    <a href={`mailto:${CONTACT.email}`} className="font-medium text-foreground underline underline-offset-4">
      {CONTACT.email}
    </a>
  );

  let heading: string;
  let body: React.ReactNode;
  let next: { href: string; label: string } | null = null;

  if (phase.kind === "checking") {
    heading = "We are confirming your payment.";
    body = "This usually takes a few seconds. Keep this page open.";
  } else if (phase.kind === "waiting") {
    heading = "We are still waiting for Paystack.";
    body = (
      <>
        Your payment has not been confirmed yet. You do not need to pay again: when it clears, your
        confirmation email follows. If nothing arrives within an hour, write to {contact}.{refLine}
      </>
    );
  } else if (phase.kind === "not-found") {
    heading = "We could not find this payment.";
    body = (
      <>
        If you paid, write to {contact} with the reference from your Paystack receipt, and we will look it
        up.
      </>
    );
  } else {
    const { status } = phase;
    const isProgram = status.kind === "program";
    const when = status.startsAt ? ` It starts on ${formatDay(status.startsAt)}.` : "";

    if (status.status === "confirmed") {
      heading = isProgram ? "You are enrolled." : "Your place is reserved.";
      body = (
        <>
          Your place {isProgram ? "in" : "at"} {status.title} is confirmed, and we have emailed you the
          details.{when}
        </>
      );
      next = isProgram ? { href: "/events", label: "See upcoming events" } : { href: "/programmes", label: "See our programmes" };
    } else if (status.status === "received") {
      heading = "Your payment arrived.";
      body = (
        <>
          We could not give you a place {isProgram ? "in" : "at"} {status.title}, because the last one was
          taken first or you had already paid. The team will contact you shortly to put it right.{refLine}
        </>
      );
    } else {
      heading = "The payment did not go through.";
      body = (
        <>
          Paystack did not confirm this payment, so no place was reserved. If money left your account,
          write to {contact}.{refLine}
        </>
      );
      next = isProgram ? { href: "/programmes", label: "Back to programmes" } : { href: "/events", label: "Back to events" };
    }
  }

  return (
    <div aria-live="polite">
      <h1 ref={headingRef} tabIndex={-1} className="text-display text-4xl outline-none sm:text-5xl">
        {heading}
      </h1>
      <p className="mt-6 max-w-[60ch] text-lg leading-[1.6] text-muted-foreground">{body}</p>
      {phase.kind === "checking" ? (
        <div aria-hidden="true" className="mt-8 h-1 w-full max-w-sm overflow-hidden bg-muted">
          <div className="h-full w-1/3 bg-foreground motion-safe:animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
      ) : null}
      {next ? (
        <Button asChild variant="secondary" size="lg" className="mt-8">
          <Link href={next.href}>{next.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
