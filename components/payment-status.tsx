"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { payment } from "@/content/payment";
import { filled } from "@/lib/content";
import { ApiError, getPaymentStatus, isValidReference, type PaymentStatus as Status } from "@/lib/api";
import { CONTACT, communityLink } from "@/lib/site";

const POLL_EVERY_MS = 2_000;
const MAX_POLLS = 15;

type Phase =
  | { kind: "checking" }
  | { kind: "settled"; status: Status }
  | { kind: "waiting" }
  | { kind: "not-found" };

/**
 * The Paystack return page (design C10). Arriving here proves nothing: anyone
 * can open this URL, and a genuine payer can lose connection before it loads.
 * So it always starts by checking, and only the API's answer moves it on.
 * Success is never shown on arrival.
 *
 * A status, not a headline: the H1 stays at 44px on every screen. Three ink
 * dots sit beside it while it checks and waits, and become a tick on success.
 * The reference shows on every state.
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

  const email = (
    <a href={`mailto:${CONTACT.email}`} className="font-semibold text-ink underline underline-offset-4">
      {CONTACT.email}
    </a>
  );
  const emailAction = (
    <Button asChild variant="text" className="self-start">
      <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
    </Button>
  );

  let mark: "dots" | "tick" | null = null;
  let heading: string;
  let body: React.ReactNode;
  let actions: React.ReactNode = null;

  if (phase.kind === "checking") {
    mark = "dots";
    heading = "We’re confirming your payment.";
    body = "This usually takes a few seconds. Keep this page open.";
  } else if (phase.kind === "waiting") {
    mark = "dots";
    heading = "We’re still waiting for Paystack.";
    body = "This can take a few minutes. You can leave this page. We’ll email you as soon as your payment clears.";
    actions = emailAction;
  } else if (phase.kind === "not-found") {
    heading = "We couldn’t find this payment.";
    body = <>If money left your account, write to {email} with your reference.</>;
    actions = (
      <Button asChild variant="secondary" size="lg" className="self-start px-5">
        <Link href="/">Go to the homepage</Link>
      </Button>
    );
  } else {
    const { status } = phase;
    const isProgram = status.kind === "program";

    if (status.status === "confirmed") {
      const community = communityLink();
      mark = "tick";
      heading = isProgram ? "You’re enrolled." : "Your place is reserved.";
      body = `We’ve emailed you the details for ${status.title}.`;
      actions = (
        <>
          <Button asChild size="lg" className="self-start px-5">
            <a href={community.href} target="_blank" rel="noopener noreferrer">
              {community.label}
            </a>
          </Button>
          <Button asChild variant="text" className="self-start">
            <Link href="/webinars">
              See upcoming webinars
              <ArrowRight />
            </Link>
          </Button>
        </>
      );
    } else if (status.status === "received") {
      // The money arrived but no place could be given: the last one went first, or they had already paid.
      heading = "Your payment arrived, but we couldn’t give you a place.";
      body = filled(payment.refundWithin)
        ? `We’ll refund you or get in touch within ${payment.refundWithin}.`
        : "We’ll refund you or get in touch to put it right.";
      actions = emailAction;
    } else {
      const listing = isProgram ? { noun: "programmes", href: "/programmes" } : { noun: "workshops", href: "/workshops" };
      heading = "The payment didn’t go through.";
      body = `No place was reserved. You can try again from the ${listing.noun} page.`;
      actions = (
        <Button asChild size="lg" className="self-start px-5">
          <Link href={listing.href}>Try again</Link>
        </Button>
      );
    }
  }

  return (
    <div aria-live="polite" className="flex max-w-[560px] flex-col gap-5">
      {reference ? (
        <p className="type-meta font-medium break-all text-ink-muted">Reference: {reference}</p>
      ) : null}

      <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 gap-y-7">
        <span aria-hidden="true" className="flex h-[45px] items-center">
          {mark === "dots" ? <Dots /> : mark === "tick" ? <TickMark /> : null}
        </span>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-[2.75rem] leading-[1.02] font-semibold tracking-[-0.01em] text-balance text-ink outline-none"
        >
          {heading}
        </h1>
        <div className="col-start-2 flex flex-col gap-7">
          <p className="type-body text-ink">{body}</p>
          {actions ? <div className="flex flex-col gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Three ink dots, taking turns to fade while motion is allowed; still otherwise. */
function Dots() {
  return (
    <span className="flex gap-1">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="size-1.5 rounded-full bg-ink motion-safe:animate-pulse"
        />
      ))}
    </span>
  );
}

function TickMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-ink stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}
