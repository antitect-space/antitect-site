"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Unavailable } from "@/components/forms/outcomes";
import { PaymentForm } from "@/components/forms/payment-form";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { Button } from "@/components/ui/button";
import { ApiError, getProgramFresh, type PublicProgram } from "@/lib/api";
import { programmeOffer, type ProgrammeOffer, type WaitlistWording } from "@/lib/programs";

type View =
  | { kind: "ready"; program: PublicProgram; offer: ProgrammeOffer; notice: string | null }
  | { kind: "checking" }
  | { kind: "gone" };

type Mode = "enrol" | "waitlist";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** The API refused a sign-up, so nothing here offers one again, whatever a record says. */
function withoutWaitlist(offer: ProgrammeOffer): ProgrammeOffer {
  return { ...offer, waitlist: null, community: !offer.enrol && !offer.nextRun };
}

/**
 * What somebody can do about this run: pay for a place, join the waitlist,
 * both, or go somewhere else. The offer is decided on the server, from the
 * same record as the rest of the page, and taken as it is: deciding it again
 * here against a different clock would draw a different panel over the HTML.
 *
 * With both on, paying leads and "Show interest" switches to the waitlist. A
 * link ending #waitlist, from a card or the hero, opens on the waitlist.
 *
 * If a sign-up is refused because the page was cached before the waitlist was
 * switched off, the panel reads the programme again from the browser and
 * redraws. Reloading would only serve the same cached page.
 */
export function ProgrammePanel({ program, offer }: { program: PublicProgram; offer: ProgrammeOffer }) {
  const [view, setView] = useState<View>({ kind: "ready", program, offer, notice: null });

  const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
  const [chosen, setChosen] = useState<Mode | null>(null);
  const mode: Mode = chosen ?? (hash === "#waitlist" ? "waitlist" : "enrol");

  const enrolRef = useRef<HTMLDivElement>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);

  // The button that was pressed has gone, so focus goes where the form now is.
  useEffect(() => {
    if (chosen) (chosen === "waitlist" ? waitlistRef : enrolRef).current?.focus();
  }, [chosen]);

  async function recheck(current: Extract<View, { kind: "ready" }>) {
    setView({ kind: "checking" });
    try {
      const fresh = await getProgramFresh(current.program.slug);
      setView({
        kind: "ready",
        program: fresh,
        offer: withoutWaitlist(programmeOffer(fresh)),
        notice: "Waitlist sign-ups for this run have closed.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setView({ kind: "gone" });
      } else {
        setView({
          ...current,
          offer: withoutWaitlist(current.offer),
          notice: "Waitlist sign-ups for this run have closed. Reload the page to see where it stands.",
        });
      }
    }
  }

  if (view.kind === "checking") {
    return (
      <p role="status" className="leading-[1.6] text-muted-foreground">
        Checking where this programme stands…
      </p>
    );
  }

  if (view.kind === "gone") {
    return (
      <Unavailable
        heading="This programme is no longer taking sign-ups."
        detail="Our other programmes are on the programmes page."
        next={{ href: "/programmes", label: "See our programmes" }}
      />
    );
  }

  const { program: shown, offer: current, notice } = view;
  const onClosed = () => recheck(view);
  const waitlistForm = (wording: WaitlistWording) => (
    <WaitlistForm slug={shown.slug} title={shown.title} wording={wording} onClosed={onClosed} />
  );

  return (
    <div id="waitlist" className="scroll-mt-4">
      {notice ? (
        <p role="status" className="mb-6 border-l-4 border-brand bg-muted px-4 py-3 leading-[1.5]">
          {notice}
        </p>
      ) : null}

      {current.enrol ? (
        <>
          {/* Both stay mounted, so switching back and forth keeps what was typed. */}
          <div ref={enrolRef} tabIndex={-1} hidden={current.waitlist !== null && mode === "waitlist"} className="outline-none">
            {current.waitlist ? (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
                <p className="font-semibold">Not ready to pay?</p>
                <Button type="button" variant="outline" onClick={() => setChosen("waitlist")}>
                  Show interest
                </Button>
              </div>
            ) : null}
            <PaymentForm
              payable={{ kind: "program", slug: shown.slug }}
              title={shown.title}
              priceKobo={shown.priceKobo}
              closesAt={shown.enrollmentClosesAt ?? shown.startsAt}
            />
          </div>

          {current.waitlist ? (
            <div ref={waitlistRef} tabIndex={-1} hidden={mode !== "waitlist"} className="outline-none">
              {waitlistForm(current.waitlist)}
              <button
                type="button"
                onClick={() => setChosen("enrol")}
                className="mt-2 font-semibold underline underline-offset-4 hover:no-underline"
              >
                Back to Secure your spot
              </button>
            </div>
          ) : null}
        </>
      ) : current.waitlist ? (
        <>
          {current.closed ? <p className="mb-6 text-lg font-semibold">{current.closed}</p> : null}
          {waitlistForm(current.waitlist)}
          {current.nextRun ? <NextRunLink link={current.nextRun} /> : null}
        </>
      ) : (
        <div>
          <h2 className="text-title text-2xl">{current.closed ?? "Sign-ups have closed."}</h2>
          {current.nextRun ? (
            <Button asChild className="mt-6">
              <Link href={current.nextRun.href}>{current.nextRun.label}</Link>
            </Button>
          ) : (
            <>
              <p className="mt-3 leading-[1.6] text-muted-foreground">
                Join the community and you will hear first when the next cohort opens.
              </p>
              <Button asChild className="mt-6">
                <Link href="/community">Join the community</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NextRunLink({ link }: { link: { href: string; label: string } }) {
  return (
    <p className="mt-6 border-t border-border pt-5">
      <Link href={link.href} className="font-semibold underline underline-offset-4 hover:no-underline">
        {link.label}
      </Link>
    </p>
  );
}
