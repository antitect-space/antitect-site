import type { PublicEvent } from "./api";
import { hasStarted } from "./format";

/**
 * A session's recording: a YouTube video, played from YouTube's
 * privacy-enhanced domain, and only when somebody taps play. Nothing from
 * YouTube loads before that except the thumbnail.
 */
export interface Recording {
  id: string;
  /** The privacy-enhanced player, for the iframe. No autoplay. */
  embedUrl: string;
  /** 480 × 360, letterboxed; shown cropped to 16:9. */
  thumbnailUrl: string;
}

const ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * The video's id, from any of the ways a YouTube link is written: a watch
 * link, a youtu.be link, an embed or Shorts link, or the privacy-enhanced
 * domain. Anything else, including a link to any other site, is no
 * recording at all.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.replace(/^(www|m)\./, "");
  const path = parsed.pathname.split("/").filter(Boolean);
  let id: string | null | undefined = null;

  if (host === "youtu.be") id = path[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (path[0] === "watch") id = parsed.searchParams.get("v");
    else if (path[0] === "embed" || path[0] === "shorts" || path[0] === "live") id = path[1];
  }

  return id && ID.test(id) ? id : null;
}

export function recordingOf(event: Pick<PublicEvent, "recordingUrl">): Recording | null {
  const id = youtubeId(event.recordingUrl);
  if (!id) return null;
  return {
    id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/**
 * The events worth showing as recordings, newest first: started, and carrying
 * a recording. Whatever else an API sends — upcoming events, a link that is
 * not YouTube — is left out.
 */
export function pastRecordings(events: readonly PublicEvent[], now: number = Date.now()) {
  return events
    .filter((event) => hasStarted(event.startsAt, now))
    .map((event) => ({ event, recording: recordingOf(event) }))
    .filter((item): item is { event: PublicEvent; recording: Recording } => item.recording !== null)
    .sort((a, b) => b.event.startsAt.localeCompare(a.event.startsAt));
}
