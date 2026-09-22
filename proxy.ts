import { NextResponse, type NextRequest } from "next/server";

import { LEARNER_COOKIE } from "@/lib/learner-session";

/**
 * What Next.js called middleware until 16. It runs before every `/learn`
 * request and does one cheap thing: sends somebody with no session to the
 * login page, remembering where they were going.
 *
 * It is an optimistic check and nothing more. A cookie here proves only that
 * one exists — whether it is valid, and whether that learner is enrolled in
 * what they asked for, is the API's answer on every single request. Nothing is
 * shown on the strength of this check alone.
 */

/** Reachable without a session: this is where somebody goes to get one. */
const PUBLIC_PAGES = new Set(["/learn/login", "/learn/forgot"]);
const PUBLIC_PREFIXES = ["/learn/invite/", "/learn/reset/"];

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PAGES.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(LEARNER_COOKIE)?.value);

  if (!hasSession && !isPublic(pathname)) {
    const login = new URL("/learn/login", request.url);
    // So they land where they were headed, not on a dashboard they did not ask for.
    if (pathname !== "/learn") login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  if (hasSession && pathname === "/learn/login") {
    return NextResponse.redirect(new URL("/learn", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/learn/:path*",
};
