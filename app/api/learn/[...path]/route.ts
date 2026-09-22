import { NextResponse, type NextRequest } from "next/server";

import { serverApiUrl } from "@/lib/api";
import {
  API_LEARNER_COOKIE,
  LEARNER_COOKIE,
  clientHeaders,
  firstForwardedFor,
  learnerCookieHeader,
  learnerCookieOptions,
  tokenFromSetCookie,
} from "@/lib/learner-session";

/**
 * The learner's one door to the API from a browser.
 *
 * Everything a learner submits goes to this origin and is forwarded from the
 * server, so the session is a first-party cookie this site sets and no browser
 * has cause to drop it. It also means the token stays out of client
 * JavaScript: the page sends a form, not a credential.
 *
 * This is deliberately not a general proxy. Only the paths below are
 * forwarded, and only with the method each one expects; anything else is a
 * 404. An open relay to the API would be a way around every rule the API
 * enforces on its own routes.
 */

export const dynamic = "force-dynamic";

const ALLOWED: ReadonlyArray<{ method: string; path: RegExp }> = [
  { method: "POST", path: /^auth\/(login|logout|forgot|reset|accept-invite|resend-invite)$/ },
];

/** The three that are supposed to come back with a session on them. */
const SESSION_GRANTING = new Set(["auth/login", "auth/accept-invite", "auth/reset"]);

/** No learner request is large. A cap keeps this from relaying anything big. */
const MAX_BODY_BYTES = 64 * 1024;

const TIMEOUT_MS = 30_000;

function isAllowed(method: string, path: string): boolean {
  return ALLOWED.some((rule) => rule.method === method && rule.path.test(path));
}

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { message, code } }, { status });
}

async function forward(request: NextRequest, segments: string[]) {
  const path = segments.join("/");
  if (!isAllowed(request.method, path)) {
    return fail(404, "NOT_FOUND", "No such endpoint.");
  }

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) {
    return fail(413, "TOO_LARGE", "That is too much data to send at once.");
  }

  const token = request.cookies.get(LEARNER_COOKIE)?.value;
  const client = firstForwardedFor(request.headers.get("x-forwarded-for"));

  let upstream: Response;
  try {
    upstream = await fetch(`${serverApiUrl()}/api/learner/${path}`, {
      method: request.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Cookie: learnerCookieHeader(token) } : {}),
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
  const issued = tokenFromSetCookie(upstream.headers);
  if (issued) {
    response.cookies.set(LEARNER_COOKIE, issued, learnerCookieOptions);
  } else if (upstream.ok && SESSION_GRANTING.has(path)) {
    // A sign-in that grants no session leaves somebody bounced back to the
    // login page with nothing to explain it. The likeliest cause by far is the
    // API naming its cookie something else, so say so where an operator sees it.
    console.error(
      `[learn] ${path} returned ${upstream.status} but set no "${API_LEARNER_COOKIE}" cookie. ` +
        `Cookies seen: ${upstream.headers.getSetCookie().map((c) => c.split("=")[0]).join(", ") || "none"}. ` +
        "Set LEARNER_API_COOKIE to the name the API uses.",
    );
  } else if (issued === "" || path === "auth/logout") {
    // Cleared with the same path it was set on, or the browser keeps the old one.
    response.cookies.set(LEARNER_COOKIE, "", { ...learnerCookieOptions, maxAge: 0 });
  }

  return response;
}

export async function POST(request: NextRequest, { params }: RouteContext<"/api/learn/[...path]">) {
  const { path } = await params;
  return forward(request, path);
}
