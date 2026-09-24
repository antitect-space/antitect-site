"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormAlert, SlowNote } from "@/components/forms/person-fields";
import { useSubmission } from "@/components/forms/use-submission";
import { JoinButton } from "@/components/learner/join";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { areaPost } from "@/lib/area-client";
import { formatDayLong, formatEventWhen, formatTime, lagosDate } from "@/lib/format";
import type { ReviewBooking, ReviewSlot } from "@/lib/learner-api";

/**
 * Picking a time for a week's Project Review Session.
 *
 * Two taps, not one: pick a time, then confirm it. On a phone a mis-tap on a
 * list of times would otherwise book the wrong one, and the fix — cancelling —
 * stops being possible close to the session.
 *
 * Every refusal comes back with a sentence meant to be shown as it stands, so
 * it is. The one that needs more than words is somebody else taking the slot a
 * moment ago: then the list is out of date, and the page re-reads it.
 */
export function SlotPicker({ programId, slots }: { programId: string; slots: ReviewSlot[] }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { slow, run } = useSubmission();

  const days = byDay(slots);
  const picked = slots.find((slot) => slot.startsAt === chosen) ?? null;

  async function book() {
    if (!picked) return;
    setError(null);
    setBusy(true);
    try {
      await run(() =>
        areaPost("learn", `programs/${encodeURIComponent(programId)}/reviews`, {
          startsAt: picked.startsAt,
        }),
      );
      router.refresh();
    } catch (cause) {
      setBusy(false);
      if (cause instanceof ApiError && cause.code === "REVIEW_SLOT_TAKEN") {
        setChosen(null);
        router.refresh();
      }
      setError(
        cause instanceof ApiError && cause.message
          ? cause.message
          : "That did not go through. Try again in a moment.",
      );
    }
  }

  return (
    <div>
      <div className="grid gap-5">
        {days.map(({ day, slots: onDay }) => (
          <div key={day}>
            <h4 className="text-[0.9375rem] font-semibold">{formatDayLong(onDay[0]!.startsAt)}</h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {onDay.map((slot) => {
                const selected = slot.startsAt === chosen;
                return (
                  <li key={slot.startsAt}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={busy}
                      onClick={() => setChosen(selected ? null : slot.startsAt)}
                      className={
                        selected
                          ? "border-2 border-foreground bg-foreground px-3 py-2 text-[0.9375rem] font-semibold text-background tabular-nums"
                          : "border-2 border-border px-3 py-2 text-[0.9375rem] font-semibold tabular-nums hover:border-foreground disabled:opacity-60"
                      }
                    >
                      {formatTime(slot.startsAt)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {picked ? (
        <div className="mt-5">
          <Button
            type="button"
            size="lg"
            onClick={book}
            disabled={busy}
            className="h-auto min-h-12 py-3 whitespace-normal"
          >
            {busy ? (
              "Booking…"
            ) : (
              <>
                Book {formatDayLong(picked.startsAt)},{" "}
                {/* The line may break before the time, never inside it. */}
                <span className="whitespace-nowrap">{formatTime(picked.startsAt)}</span>
              </>
            )}
          </Button>
          <SlowNote show={busy && slow} />
        </div>
      ) : null}

      <FormAlert message={error} className="mt-4" />
    </div>
  );
}

/**
 * A week's booked session: when, the way in, and the way out while there is
 * still time to take it.
 */
export function BookedReview({
  booking,
  ended,
  cancelCutoffHours,
  tutorName,
}: {
  booking: ReviewBooking;
  /** Already held: nothing to join and nothing to cancel, just a record. */
  ended: boolean;
  cancelCutoffHours: number;
  tutorName: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const when = formatEventWhen(booking.startsAt, booking.endsAt);

  async function cancel() {
    setError(null);
    setBusy(true);
    try {
      await areaPost("learn", `reviews/${encodeURIComponent(booking.id)}/cancel`);
      // Cancelling frees the week, so its times come back: re-read rather
      // than guess which ones.
      router.refresh();
    } catch (cause) {
      setBusy(false);
      setConfirming(false);
      setError(
        cause instanceof ApiError && cause.message
          ? cause.message
          : "That did not cancel. Try again in a moment.",
      );
    }
  }

  if (ended) {
    return (
      <p className="leading-[1.5] text-muted-foreground">
        Held {when.date}, {when.time}.
      </p>
    );
  }

  return (
    <div>
      <p className="text-lg leading-[1.4] font-semibold">
        {when.date}
        <br />
        {when.time}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {booking.joinUrl ? (
          <JoinButton joinUrl={booking.joinUrl} startsAt={booking.startsAt} endsAt={booking.endsAt} />
        ) : null}

        {booking.canCancel && !confirming ? (
          <Button type="button" variant="link" className="px-0" onClick={() => setConfirming(true)}>
            Cancel this session
          </Button>
        ) : null}
      </div>

      {confirming ? (
        <div role="group" aria-label="Cancel this session?" className="mt-4 flex flex-wrap items-center gap-3">
          <span className="font-semibold">Cancel it?</span>
          <Button type="button" variant="secondary" onClick={cancel} disabled={busy}>
            {busy ? "Cancelling…" : "Yes, cancel it"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={busy}>
            Keep it
          </Button>
        </div>
      ) : null}

      {!booking.canCancel ? (
        <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-[1.5] text-muted-foreground">
          It is less than {cancelCutoffHours} hours away, so it can no longer be cancelled here. If you
          cannot make it, let {tutorName ?? "your tutor"} know.
        </p>
      ) : null}

      <FormAlert message={error} className="mt-4" />
    </div>
  );
}

/** Slots grouped by their Lagos day, in time order. */
function byDay(slots: readonly ReviewSlot[]): Array<{ day: string; slots: ReviewSlot[] }> {
  const groups = new Map<string, ReviewSlot[]>();
  for (const slot of [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const day = lagosDate(slot.startsAt);
    groups.set(day, [...(groups.get(day) ?? []), slot]);
  }
  return [...groups.entries()].map(([day, onDay]) => ({ day, slots: onDay }));
}
