import { ApiError, readApiError, serverApiUrl } from "./api";
import type { Area } from "./area";
import { clientHeaders, sessionCookieHeader, sessionToken, visitorIp } from "./area-session";

/**
 * How a signed-in page reads from the API, for both areas.
 *
 * Nothing here is ever cached. A learner's feedback, a tutor's review queue —
 * they are personal and change without warning, so every page fetches per
 * request with `no-store`, never the sixty-second cache the public pages run
 * on.
 */

/** Long enough for an API waking from sleep, short enough that a page is not held open forever. */
const TIMEOUT_MS = 20_000;

/** No usable session. Pages turn this into a redirect to their area's sign-in. */
export class NoSession extends Error {
  constructor() {
    super("No session");
    this.name = "NoSession";
  }
}

/**
 * Signed in, but this is somebody else's.
 *
 * A real answer, not a fault: entitlement comes from being enrolled in a run,
 * or teaching it, and never from being logged in. It must never be turned into
 * a redirect to the sign-in form — that would send somebody who is already
 * signed in back to a page they have finished with, and around a loop.
 */
export class NotYours extends Error {
  constructor(message = "You do not have access to this.") {
    super(message);
    this.name = "NotYours";
  }
}

export async function areaRead<T>(area: Area, path: string): Promise<T> {
  const token = await sessionToken(area);
  if (!token) throw new NoSession();

  let response: Response;
  try {
    response = await fetch(`${serverApiUrl()}${area.apiBase}${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: sessionCookieHeader(area, token),
        ...clientHeaders(await visitorIp()),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new ApiError(0, "NETWORK", `Could not reach the API for ${path}: ${reason}`);
  }

  if (response.status === 401) throw new NoSession();
  if (response.status === 403) throw new NotYours((await readApiError(response)).message);
  if (!response.ok) throw await readApiError(response);
  return (await response.json()) as T;
}
