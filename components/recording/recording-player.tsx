"use client";

import { useEffect, useRef, useState } from "react";

import { RecordingThumbnail } from "@/components/recording/thumbnail";
import type { Recording } from "@/lib/recordings";

/**
 * The recording on a webinar's page (design W2, "Recording player"): the
 * poster until somebody taps play, then YouTube's privacy-enhanced player in
 * its place. Nothing from YouTube but the thumbnail loads before the tap, and
 * nothing plays by itself: the player that loads waits for its own play.
 *
 * Full width of its column, at 16:9. Focus moves into the player once it is
 * there, so a keyboard carries straight on.
 */
export function RecordingPlayer({
  recording,
  title,
  sizes = "(min-width: 1024px) 760px, 100vw",
  preload = false,
}: {
  recording: Recording;
  title: string;
  sizes?: string;
  preload?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  if (playing) {
    return (
      <div className="relative aspect-video w-full bg-ink">
        <iframe
          ref={frameRef}
          src={recording.embedUrl}
          title={`Recording: ${title}`}
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play recording: ${title}`}
      className="block w-full cursor-pointer"
    >
      <RecordingThumbnail src={recording.thumbnailUrl} sizes={sizes} preload={preload} />
    </button>
  );
}
