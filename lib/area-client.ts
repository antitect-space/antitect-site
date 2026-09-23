"use client";

import { ApiError, readApiError } from "./api";
import type { AreaName } from "./area-view";

/**
 * What a signed-in form posts to, which is this site and never the API.
 *
 * The request goes to `/api/<area>/*` on this origin and is forwarded from the
 * server with the session attached. Nothing here reads or writes a cookie: the
 * browser cannot see the token, which is the point.
 */

/** Long enough to outlast an API waking from sleep. */
const TIMEOUT_MS = 60_000;

export async function areaPost<T>(area: AreaName, path: string, body: unknown = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${area}/${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "We could not reach our server.");
  }

  if (!response.ok) throw await readApiError(response);
  return (response.status === 204 ? undefined : await response.json()) as T;
}
