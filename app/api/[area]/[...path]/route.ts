import { NextResponse, type NextRequest } from "next/server";

import { serverApiUrl } from "@/lib/api";
import { AREAS, mayForward, type Area } from "@/lib/area";
import { isAreaName } from "@/lib/area-view";
import {
  clientHeaders,
  firstForwardedFor,
  sessionCookieHeader,
  sessionCookieOptions,
  sessionFromSetCookie,
} from "@/lib/area-session";

/**
 * The one door to the API from a browser, for both signed-in areas.
 *
 * Everything somebody submits goes to this origin and is forwarded from the
 * server, so the session is a first-party cookie this site sets and no browser
 * has cause to drop it. It also means the token stays out of client
 * JavaScript: the page sends a form, not a credential.
 *
 * This is deliberately not a general proxy. Each area names the paths it will
 * forward and the method each one takes; anything else is a 404.
 */

export const dynamic = "force-dynamic";

/** No sign-in request is large. A cap keeps this from relaying anything big. */
const MAX_BODY_BYTES = 64 * 1024;

const TIMEOUT_MS = 30_000;

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

async function forward(request: NextRequest, area: Area, segments: string[]) {
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

  // Whatever the API decided about the session, this site's cookie follows it:
  // a token to hold, or an empty one, which is how a logout arrives.
  const issued = sessionFromSetCookie(area, upstream.headers);
  if (issued?.value) {
    response.cookies.set(area.cookie, issued.value, {
      ...sessionCookieOptions,
      // Never longer than the token it holds.
      ...(issued.maxAge !== null && issued.maxAge > 0 ? { maxAge: issued.maxAge } : {}),
    });
  } else if (upstream.ok && area.sessionGranting.has(path)) {
    // A sign-in that grants no session leaves somebody bounced back to the
    // login page with nothing to explain it. The likeliest cause by far is the
    // API naming its cookie something else, so say so where an operator sees it.
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
}

export async function POST(request: NextRequest, { params }: RouteContext<"/api/[area]/[...path]">) {
  const { area, path } = await params;
  if (!isAreaName(area)) return fail(404, "NOT_FOUND", "No such endpoint.");
  return forward(request, AREAS[area], path);
}
