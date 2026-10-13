"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Panel } from "@/components/detail/panel";
import { CommunityForm } from "@/components/forms/community-form";
import { FormHead } from "@/components/forms/fields";
import { PaymentForm } from "@/components/forms/payment-form";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { Button } from "@/components/ui/button";
import { ApiError, getProgramFresh, type PublicProgram } from "@/lib/api";
import { placesNote } from "@/lib/events";
import { formatDay } from "@/lib/format";
import { programmeOffer, runName, type ProgrammeOffer } from "@/lib/programs";

const ID = "register";

type View =
  | { kind: "ready"; program: PublicProgram; offer: ProgrammeOffer; notice: string | null }
  | { kind: "checking" }
  | { kind: "gone" };

/** The API refused a sign-up, so nothing here offers one again, whatever a record says. */
function withoutWaitlist(offer: ProgrammeOffer): ProgrammeOffer {
  return { ...offer, captureLead: false, waitlist: null, community: !offer.enrol && !offer.nextRun };
}

/** The API refused a place, so the form is not offered again until the page is reloaded. */
function withoutEnrolment(offer: ProgrammeOffer, kind: "full" | "closed", program: PublicProgram): ProgrammeOffer {
  const run = runName(program);
  return {
    ...offer,
    enrol: false,
    captureLead: false,
    closed: kind === "full" ? "This cohort is full." : run ? `Enrolment for ${run} has closed.` : "Enrolment has closed.",
    community: !offer.waitlist && !offer.nextRun,
  };
}

/**
 * The enrolment panel (design C6): what somebody can do about this run. Pay
 * for a place in two steps, join the waitlist, go to the next run, or join
 * the community. The offer is decided on the server, from the same record as
 * the rest of the page, and taken as it is: deciding it again here against a
 * different clock would draw a different panel over the HTML.
 *
 * With both on there is one form, the checkout, and its first step puts them
 * on the waitlist. Links ending #waitlist, from a card or the hero, land here.
 *
 * If a sign-up or a place is refused because the page was cached before the
 * programme changed, the panel reads the programme again from the browser
 * and redraws. Reloading would only serve the same cached page.
 */
export function ProgrammePanel({ program, offer }: { program: PublicProgram; offer: ProgrammeOffer }) {
  const [view, setView] = useState<View>({ kind: "ready", program, offer, notice: null });
  // After a refusal the form somebody was using has gone; focus goes to what replaced it.
  const [announce, setAnnounce] = useState(false);
  useEffect(() => {
    if (announce && view.kind !== "checking") document.getElementById(`${ID}-title`)?.focus();
  }, [announce, view]);

  async function recheck(current: Extract<View, { kind: "ready" }>, refused: "waitlist" | "full" | "closed") {
    setAnnounce(true);
    setView({ kind: "checking" });
    const notice = refused === "waitlist" ? "Waitlist sign-ups for this run have closed." : null;
    try {
      const fresh = await getProgramFresh(current.program.slug);
      const freshOffer = programmeOffer(fresh);
      setView({
        kind: "ready",
        program: fresh,
        offer: refused === "waitlist" ? withoutWaitlist(freshOffer) : freshOffer.enrol ? withoutEnrolment(freshOffer, refused, fresh) : freshOffer,
        notice,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setView({ kind: "gone" });
      } else {
        setView({
          ...current,
          offer: refused === "waitlist" ? withoutWaitlist(current.offer) : withoutEnrolment(current.offer, refused, current.program),
          notice: notice ? `${notice} Reload the page to see where it stands.` : null,
        });
      }
    }
  }

  let body: React.ReactNode;

  if (view.kind === "checking") {
    body = (
      <p role="status" className="type-body text-ink-muted">
        Checking where this programme stands…
      </p>
    );
  } else if (view.kind === "gone") {
    body = (
      <div role="status" className="flex flex-col gap-6">
        <FormHead
          id={`${ID}-title`}
          title="This programme is no longer taking sign-ups."
          line="Our other programmes are on the programmes page."
        />
        <Button asChild variant="outline" size="lg" className="w-full px-5">
          <Link href="/programmes">See our programmes</Link>
        </Button>
      </div>
    );
  } else {
    const { program: shown, offer: current } = view;
    const next = shown.nextRun && current.nextRun ? shown.nextRun : null;

    if (current.enrol) {
      body = (
        <PaymentForm
          payable={{ kind: "program", slug: shown.slug }}
          title={shown.title}
          priceKobo={shown.priceKobo}
          closesAt={shown.enrollmentClosesAt ?? shown.startsAt}
          captureLead={current.captureLead}
          places={placesNote(shown)}
          idPrefix={ID}
          onRefused={(kind) => recheck(view, kind)}
        />
      );
    } else if (current.waitlist) {
      // A draft has never enrolled; a full or closed run says why before offering the list.
      const draft = current.waitlist === "join";
      body = (
        <div className="flex flex-col gap-6">
          <WaitlistForm
            slug={shown.slug}
            title={shown.title}
            heading={draft ? "Join the waitlist" : (current.closed ?? "Join the waitlist for the next cohort")}
            line={draft ? "Dates and price to be announced. Join the waitlist and you’ll hear first." : undefined}
            idPrefix={ID}
            onClosed={() => recheck(view, "waitlist")}
          />
          {current.nextRun ? (
            <p className="border-t border-rule pt-5">
              <Link href={current.nextRun.href} className="type-body font-semibold text-ink underline underline-offset-4 hover:no-underline">
                {current.nextRun.label}
              </Link>
            </p>
          ) : null}
        </div>
      );
    } else if (current.nextRun) {
      const run = next ? runName(next) : null;
      body = (
        <div className="flex flex-col gap-4">
          <FormHead id={`${ID}-title`} title={current.closed ?? "Sign-ups have closed."} />
          {next?.startsAt ? (
            <p className="type-body text-ink">
              <span className="font-semibold">{run ?? "The next cohort"} starts</span>{" "}
              <time dateTime={next.startsAt} className="tabular-nums">
                {formatDay(next.startsAt)}
              </time>
            </p>
          ) : null}
          <div className="pt-2">
            <Button asChild size="lg" className="w-full px-5">
              <Link href={current.nextRun.href}>{run ? `See ${run}` : current.nextRun.label}</Link>
            </Button>
          </div>
        </div>
      );
    } else {
      body = (
        <div className="flex flex-col gap-5">
          <FormHead id={`${ID}-title`} title={current.closed ?? "Sign-ups have closed."} />
          <CommunityForm idPrefix={`${ID}-community`} />
        </div>
      );
    }
  }

  const notice = view.kind === "ready" ? view.notice : null;

  return (
    <div id="waitlist" className="scroll-mt-8">
      <Panel id={ID} aria-labelledby={`${ID}-title`} aria-busy={view.kind === "checking" || undefined} className="scroll-mt-8">
        {notice ? (
          <p role="status" className="type-small border-l-4 border-brand bg-wash py-3 pr-4 pl-5 text-ink">
            {notice}
          </p>
        ) : null}
        {body}
      </Panel>
    </div>
  );
}
