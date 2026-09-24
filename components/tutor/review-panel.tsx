"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { areaPost } from "@/lib/area-client";
import type { Decision } from "@/lib/tutor-api";

/**
 * Approve, or ask for changes. The whole job, and the thing a cohort waits on.
 *
 * Claiming the submission happens here, after the page has rendered — never
 * during it. Next prefetches links on hover and in the viewport, so a claim
 * made while rendering would let a mouse passing over the queue claim work
 * nobody opened.
 *
 * Feedback is required either way. An approval with nothing said teaches
 * nothing, and a revision request without a reason is just a closed door.
 */
export function ReviewPanel({
  submissionId,
  learnerName,
  projectTitle,
}: {
  submissionId: string;
  learnerName: string;
  projectTitle: string;
}) {
  const [feedback, setFeedback] = useState("");
  const [decided, setDecided] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsFeedback, setNeedsFeedback] = useState(false);
  const { slow, run } = useSubmission();
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Claimed once the tutor is actually looking at it. Failure is silent on
    // purpose: not claiming is a smaller problem than a screen that will not
    // open, and the decision below works either way.
    areaPost("teach", `submissions/${encodeURIComponent(submissionId)}/start-review`).catch(
      () => {},
    );
  }, [submissionId]);

  async function decide(decision: Decision) {
    const said = feedback.trim();
    if (!said) {
      setNeedsFeedback(true);
      box.current?.focus();
      return;
    }

    setError(null);
    setNeedsFeedback(false);
    try {
      await run(() =>
        areaPost("teach", `submissions/${encodeURIComponent(submissionId)}/decision`, {
          decision,
          feedback: said,
        }),
      );
      // Deliberately no refresh: the confirmation below says more than the
      // decided view a re-read would show. The API has already told the
      // learner; the queue is never cached, so it is current on arrival.
      setDecided(decision);
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "SUBMISSION_DECIDED") {
        // The API 409s here only once approved; a revision request can still be
        // overturned. Either way, a refresh shows what was decided.
        setError("Somebody has already decided this one. Refresh to see what they said.");
        return;
      }
      setError(
        cause instanceof ApiError && cause.message
          ? cause.message
          : "That did not save. Your feedback is still here, so try again in a moment.",
      );
    }
  }

  if (decided) {
    return (
      <div role="status" className="border-2 border-foreground p-6">
        <h2 className="text-title text-2xl">
          {decided === "approve" ? "Approved." : "Changes asked for."}
        </h2>
        <p className="mt-3 leading-[1.6] text-muted-foreground">
          {decided === "approve"
            ? `${learnerName} has been told, and their next project is open.`
            : `${learnerName} has your feedback and can send a new version.`}
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/teach/review">Back to the queue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground p-6">
      <label htmlFor="feedback" className="text-title block text-xl">
        Your feedback
      </label>
      <p className="mt-2 text-[0.9375rem] leading-[1.5] text-muted-foreground">
        {learnerName} reads this against {projectTitle}. Markdown works — lists especially, when
        there is more than one thing to fix.
      </p>

      <textarea
        id="feedback"
        ref={box}
        rows={10}
        value={feedback}
        onChange={(event) => {
          setFeedback(event.target.value);
          if (needsFeedback) setNeedsFeedback(false);
        }}
        aria-invalid={needsFeedback ? true : undefined}
        aria-describedby={needsFeedback ? "feedback-error" : undefined}
        className="mt-4 w-full rounded-md border border-input bg-background p-3 text-base outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20 aria-invalid:border-brand aria-invalid:ring-2 aria-invalid:ring-brand/15"
      />
      {needsFeedback ? (
        <p id="feedback-error" className="mt-2 text-sm font-medium text-brand">
          Say something first — it is the part they learn from.
        </p>
      ) : null}

      <FormAlert message={error} className="mt-5" />

      {/* Approve leads: in a cohort that is going well it is the answer most
          often, and red here is this site's primary action rather than a
          warning colour. */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" size="lg" onClick={() => decide("approve")}>
          Approve
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => decide("request_revision")}>
          Request a revision
        </Button>
      </div>
      <SlowNote show={slow} />
    </div>
  );
}
