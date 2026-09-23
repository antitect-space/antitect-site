"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Field, FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { areaPost } from "@/lib/area-client";
import { useNow } from "@/lib/use-now";
import {
  EMPTY_SUBMISSION,
  submissionSchema,
  type SubmissionBody,
  type SubmissionInput,
} from "@/lib/submissions";

/**
 * Sending work in.
 *
 * A deadline that has passed is a warning, never a closed door: the API
 * accepts late work and marks it late, and a form that refused it would
 * strand the one person who most needs to hand something in. What does close
 * it is the API's own answer — a project still locked, or a version already
 * with the reviewer — and then the form is replaced by what is actually true.
 *
 * Nothing is editable once sent. A revision is a new version, so the page
 * simply reloads into whatever state the API now reports.
 */
export function SubmissionForm({
  programId,
  projectId,
  deadlineAt,
  isRevision,
}: {
  programId: string;
  projectId: string;
  deadlineAt: string | null;
  isRevision: boolean;
}) {
  const router = useRouter();
  const now = useNow();
  const [closed, setClosed] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { slow, run } = useSubmission();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SubmissionInput, unknown, SubmissionBody>({
    // Checked as they go: an error on the field they just left, rather
    // than a list of them after a round trip nobody needed to spend.
    mode: "onTouched",
    reValidateMode: "onChange",
    resolver: zodResolver(submissionSchema),
    defaultValues: EMPTY_SUBMISSION,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "links" });

  const late = Boolean(deadlineAt) && now > 0 && new Date(deadlineAt!).getTime() < now;

  async function onSubmit(body: SubmissionBody) {
    setFormError(null);
    try {
      await run(() =>
        areaPost(
          "learn",
          `programs/${encodeURIComponent(programId)}/projects/${encodeURIComponent(projectId)}/submissions`,
          body,
        ),
      );
      // The API decides what happens next — the state, the version number, the
      // late flag — so the page re-reads rather than guessing at any of it.
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.code === "PROJECT_LOCKED") {
        setClosed("The project before this one needs approving first. It opens as soon as it is.");
        return;
      }
      if (error instanceof ApiError && error.code === "SUBMISSION_IN_REVIEW") {
        setClosed("Your last version is with your tutor. You can send another once they reply.");
        return;
      }
      setFormError(messageFor(error));
    }
  }

  if (closed) {
    return (
      <div role="status" className="border-2 border-foreground p-5">
        <p className="leading-[1.6]">{closed}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => router.refresh()}>
          Refresh this page
        </Button>
      </div>
    );
  }

  const busy = isSubmitting || (isSubmitSuccessful && !formError);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Send your work">
      <fieldset disabled={busy} className="grid gap-5">
        <legend className="sr-only">Links to your work</legend>

        {fields.map((field, index) => (
          // Each pair is its own group, named for a screen reader only: three
          // fields called "What it is" read the same out loud otherwise, and
          // numbering them on screen would be clutter nobody needs.
          <fieldset key={field.id} className="grid gap-3 sm:grid-cols-[1fr_1.6fr]">
            <legend className="sr-only">Link {index + 1}</legend>
            <Field
              id={`link-label-${index}`}
              label="What it is"
              error={errors.links?.[index]?.label?.message}
            >
              <Input
                id={`link-label-${index}`}
                placeholder={PLACEHOLDERS[index] ?? "What this link shows"}
                aria-invalid={errors.links?.[index]?.label ? true : undefined}
                {...register(`links.${index}.label`)}
              />
            </Field>
            <Field
              id={`link-url-${index}`}
              label="Link"
              error={errors.links?.[index]?.url?.message}
            >
              <div className="flex gap-2">
                <Input
                  id={`link-url-${index}`}
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="https://"
                  aria-invalid={errors.links?.[index]?.url ? true : undefined}
                  {...register(`links.${index}.url`)}
                />
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="shrink-0 px-2 text-[0.9375rem] font-semibold underline underline-offset-4 hover:no-underline"
                  >
                    Remove
                    <span className="sr-only"> link {index + 1}</span>
                  </button>
                ) : null}
              </div>
            </Field>
          </fieldset>
        ))}

        <div>
          <Button type="button" variant="outline" onClick={() => append({ label: "", url: "" })}>
            Add another link
          </Button>
        </div>

        <Field id="submission-notes" label="Anything you want to say about it" optional>
          <textarea
            id="submission-notes"
            rows={4}
            className="w-full rounded-md border border-input bg-background p-3 text-base outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
            {...register("notes")}
          />
        </Field>
      </fieldset>

      {late ? <LateNote /> : null}
      <FormAlert message={formError} className="mt-6" />

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? "Sending…" : isRevision ? "Send a new version" : "Send it in"}
      </Button>
      <SlowNote show={busy && slow} />
    </form>
  );
}

/** What the first rows usually hold, per the submission guidelines. */
const PLACEHOLDERS = ["Loom demo", "The workflow"];

/** Says what will happen, and does not stand in the way of it. */
function LateNote() {
  return (
    <p className="mt-6 border-l-2 border-foreground pl-4 leading-[1.5]">
      The deadline for this one has passed. You can still send it — it will be marked late, and your
      tutor will still review it.
    </p>
  );
}

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong on our side. Your links are still here, so try again in a moment.";
  }
  if (error.code === "NETWORK") {
    return "We could not reach our server. Check your connection and try again.";
  }
  const firstDetail = Object.values(error.details ?? {})[0]?.[0];
  return firstDetail || error.message || "Check those links and try again.";
}
