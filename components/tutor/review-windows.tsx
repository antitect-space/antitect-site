"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Field, FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { areaDelete, areaPost } from "@/lib/area-client";
import { formatDayLong, formatTime, lagosInstant } from "@/lib/format";
import type { ReviewWindow, WindowSlot } from "@/lib/tutor-api";

/**
 * Opening time for Project Review Sessions: a day, a start, an end, and
 * optionally a link. The API cuts it into slots and learners book them.
 *
 * The checks here are only the ones that are true whatever the API decides:
 * all three times are needed, the end comes after the start, the length is a
 * whole number of sessions, and a link, if given, is https. Everything that
 * depends on the run — inside its weeks, clear of other windows, not in the
 * past — is the API's to answer, and its answer lands on the field it is about.
 */
export function OpenWindowForm({ programId, minutes }: { programId: string; minutes: number }) {
  const router = useRouter();
  const [day, setDay] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"day" | "from" | "to" | "link", string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { slow, run } = useSubmission();

  function check(): boolean {
    const found: typeof errors = {};
    if (!day) found.day = "Choose a day.";
    if (!from) found.from = "Choose a start time.";
    if (!to) found.to = "Choose an end time.";
    if (from && to) {
      const length = toMinutes(to) - toMinutes(from);
      if (length <= 0) found.to = "End after the start.";
      else if (length % minutes !== 0)
        found.to = `Make it a whole number of ${minutes}-minute sessions.`;
    }
    if (link.trim() && !/^https:\/\/\S+$/i.test(link.trim()))
      found.link = "Use a full link starting with https://";
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function open() {
    setFormError(null);
    if (!check()) return;
    setBusy(true);
    try {
      await run(() =>
        areaPost("teach", `programs/${encodeURIComponent(programId)}/review-windows`, {
          startsAt: lagosInstant(day, from),
          endsAt: lagosInstant(day, to),
          ...(link.trim() ? { joinUrl: link.trim() } : {}),
        }),
      );
      setDay("");
      setFrom("");
      setTo("");
      setLink("");
      router.refresh();
    } catch (cause) {
      const details = cause instanceof ApiError ? (cause.details ?? {}) : {};
      const onFields: typeof errors = {
        ...(details.startsAt?.[0] ? { from: details.startsAt[0] } : {}),
        ...(details.endsAt?.[0] ? { to: details.endsAt[0] } : {}),
        ...(details.joinUrl?.[0] ? { link: details.joinUrl[0] } : {}),
      };
      if (Object.keys(onFields).length > 0) setErrors(onFields);
      else
        setFormError(
          cause instanceof ApiError && cause.message
            ? cause.message
            : "That did not save. Try again in a moment.",
        );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      noValidate
      aria-label="Open time for Project Review Sessions"
      onSubmit={(event) => {
        event.preventDefault();
        void open();
      }}
    >
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-3">
        <legend className="sr-only">When</legend>
        <Field id="window-day" label="Day" error={errors.day}>
          <Input id="window-day" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
        </Field>
        <Field id="window-from" label="From (WAT)" error={errors.from}>
          <Input
            id="window-from"
            type="time"
            step={minutes * 60}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field id="window-to" label="To (WAT)" error={errors.to}>
          <Input
            id="window-to"
            type="time"
            step={minutes * 60}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
      </fieldset>

      <div className="mt-4">
        <Field
          id="window-link"
          label="Meeting link"
          optional
          hint="Leave it empty to use the programme's usual Meet link."
          error={errors.link}
        >
          <Input
            id="window-link"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="https://"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={busy}
          />
        </Field>
      </div>

      <FormAlert message={formError} className="mt-5" />
      <Button type="submit" size="lg" className="mt-5" disabled={busy}>
        {busy ? "Opening…" : "Open this time"}
      </Button>
      <SlowNote show={busy && slow} />
    </form>
  );
}

/**
 * One window of time: its slots, who took each, and what can still be done
 * about it. A booked window cannot be closed — each learner in it has to be
 * cancelled first, so that each is told — and the button says so rather than
 * failing when pressed.
 */
export function WindowCard({ window, past }: { window: ReviewWindow; past: boolean }) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const booked = window.slots.filter((slot) => slot.booking).length;

  async function close() {
    setError(null);
    setClosing(true);
    try {
      await areaDelete("teach", `review-windows/${encodeURIComponent(window.id)}`);
      router.refresh();
    } catch (cause) {
      setClosing(false);
      setError(
        cause instanceof ApiError && cause.message
          ? cause.message
          : "That did not close. Try again in a moment.",
      );
    }
  }

  return (
    <li className={`min-w-0 p-5 sm:p-6 ${past ? "bg-muted" : "bg-background"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="text-title text-xl">
          {formatDayLong(window.startsAt)} · {formatTime(window.startsAt)} –{" "}
          {formatTime(window.endsAt)}
        </h3>
        <p className="text-[0.9375rem] text-muted-foreground">
          {booked} of {window.slots.length} booked
        </p>
      </div>
      {window.joinUrl ? (
        <p className="mt-1 text-[0.9375rem]">
          <a
            href={window.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:no-underline"
          >
            Meeting link
          </a>
        </p>
      ) : null}

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {window.slots.map((slot) => (
          <SlotLine key={slot.startsAt} slot={slot} past={past} />
        ))}
      </ul>

      {!past ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={booked > 0 || closing}
            aria-describedby={booked > 0 ? `why-${window.id}` : undefined}
          >
            {closing ? "Closing…" : "Close this window"}
          </Button>
          {booked > 0 ? (
            <p id={`why-${window.id}`} className="mt-2 text-[0.9375rem] text-muted-foreground">
              Cancel {booked === 1 ? "the booking" : `the ${booked} bookings`} first, so{" "}
              {booked === 1 ? "that learner is" : "each learner is"} told.
            </p>
          ) : null}
        </div>
      ) : null}
      <FormAlert message={error} className="mt-4" />
    </li>
  );
}

function SlotLine({ slot, past }: { slot: WindowSlot; past: boolean }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const booking = slot.booking;

  async function cancel() {
    if (!booking) return;
    setError(null);
    setBusy(true);
    try {
      await areaPost("teach", `reviews/${encodeURIComponent(booking.id)}/cancel`, {
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      router.refresh();
    } catch (cause) {
      setBusy(false);
      setError(
        cause instanceof ApiError && cause.message
          ? cause.message
          : "That did not cancel. Try again in a moment.",
      );
    }
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="tabular-nums">
          <span className="font-semibold">{formatTime(slot.startsAt)}</span>{" "}
          {booking ? (
            <>
              · {booking.learnerName}
              {booking.learnerEmail ? (
                <span className="text-muted-foreground"> · {booking.learnerEmail}</span>
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground">· open</span>
          )}
        </p>
        {booking && !past && !asking ? (
          <Button type="button" variant="link" className="px-0" onClick={() => setAsking(true)}>
            Cancel booking
            <span className="sr-only"> for {booking.learnerName}</span>
          </Button>
        ) : null}
      </div>

      {booking && asking ? (
        <div className="mt-3 grid gap-3">
          <Field
            id={`reason-${booking.id}`}
            label={`Why, for ${booking.learnerName}`}
            optional
            hint="Emailed to them. They can then book another time that week."
          >
            <textarea
              id={`reason-${booking.id}`}
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-3 text-base outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </Field>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={cancel} disabled={busy}>
              {busy ? "Cancelling…" : `Cancel and tell ${booking.learnerName}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setAsking(false)} disabled={busy}>
              Keep it
            </Button>
          </div>
        </div>
      ) : null}
      <FormAlert message={error} className="mt-3" />
    </li>
  );
}

function toMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}
