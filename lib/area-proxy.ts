import { NextResponse, type NextRequest } from "next/server";

import { serverApiUrl } from "./api";
import { AREAS, mayForward } from "./area";
import type { AreaName } from "./area-view";
import {
  clientHeaders,
  firstForwardedFor,
  sessionCookieHeader,
  sessionCookieOptions,
  sessionFromSetCookie,
} from "./area-session";

/**
 * The one door to the API from a browser, shared by both signed-in areas.
 *
 * Everything somebody submits goes to this origin and is forwarded from the
 * server, so the session is a first-party cookie this site sets and no browser
 * has cause to drop it. It also means the token stays out of client
 * JavaScript: the page sends a form, not a credential.
 *
 * Each area names the paths it will forward and the method each one takes;
 * anything else is a 404. It is mounted at `/api/learn` and `/api/teach`
 * rather than at a dynamic `/api/[area]`, because a catch-all there would
 * answer for every other path under `/api` too — including a stray request
 * meant for the CRM, which then fails as a confusing 405 instead of a plain
 * 404.
 */

/** No sign-in or submission is large. A cap keeps this from relaying anything big. */
const MAX_BODY_BYTES = 64 * 1024;

const TIMEOUT_MS = 30_000;

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

export function forwardArea(name: AreaName) {
  const area = AREAS[name];

  return async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
  ) {
    const { path: segments } = await params;
    const path = segments.join("/");

    if (!mayForward(area, request.method, path)) {
      return fail(404, "NOT_FOUND", "No such endpoint.");
    }

    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) {
      return fail(413, "TOO_LARGE", "That is too much data to send at once.");
    }

    const token = request.cookies.get(area.cookie)?.value;
    const client = firstForwardedFor(request.headers.get("x-forwarded-for"));

    let upstream: Response;
    try {
      upstream = await fetch(`${serverApiUrl()}${area.apiBase}/${path}`, {
        method: request.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Cookie: sessionCookieHeader(area, token) } : {}),
          // So the API can rate-limit the person, not this server.
          ...clientHeaders(client),
        },
        body: body || undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      return fail(503, "NETWORK", "We could not reach our server. Try again in a moment.");
    }

    const text = await upstream.text();
    const response = new NextResponse(text || null, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });

    // Whatever the API decided about the session, this site's cookie follows
    // it: a token to hold, or an empty one, which is how a logout arrives.
    const issued = sessionFromSetCookie(area, upstream.headers);
    if (issued?.value) {
      response.cookies.set(area.cookie, issued.value, {
        ...sessionCookieOptions,
        // Never longer than the token it holds.
        ...(issued.maxAge !== null && issued.maxAge > 0 ? { maxAge: issued.maxAge } : {}),
      });
    } else if (upstream.ok && area.sessionGranting.has(path)) {
      // A sign-in that grants no session leaves somebody bounced back to the
      // login page with nothing to explain it. The likeliest cause by far is
      // the API naming its cookie something else, so say so where an operator
      // sees it.
      console.error(
        `[${area.name}] ${path} returned ${upstream.status} but set no "${area.apiCookie}" cookie. ` +
          `Cookies seen: ${upstream.headers.getSetCookie().map((c) => c.split("=")[0]).join(", ") || "none"}. ` +
          "Set the API cookie name for this area.",
      );
    } else if (issued?.value === "" || path === "auth/logout") {
      // Cleared with the same path it was set on, or the browser keeps the old one.
      response.cookies.set(area.cookie, "", { ...sessionCookieOptions, maxAge: 0 });
    }

    return response;
  };
}
