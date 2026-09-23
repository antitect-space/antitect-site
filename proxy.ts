import { NextResponse, type NextRequest } from "next/server";

import { areaForPath, isPublicPage } from "@/lib/area";

/**
 * What Next.js called middleware until 16. It runs before every page in a
 * signed-in area and does one cheap thing: sends somebody with no session to
 * that area's sign-in, remembering where they were going.
 *
 * It is an optimistic check and nothing more. A cookie here proves only that
 * one exists — whether it is valid, and whether that person is enrolled in the
 * run they asked for, or teaches it, is the API's answer on every single
 * request. Nothing is shown on the strength of this check alone.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const area = areaForPath(pathname);
  if (!area) return NextResponse.next();

  const login = `${area.home}/login`;
  const hasSession = Boolean(request.cookies.get(area.cookie)?.value);

  if (!hasSession && !isPublicPage(area, pathname)) {
    const url = new URL(login, request.url);
    // So they land where they were headed, not on a dashboard they did not ask for.
    if (pathname !== area.home) url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === login) {
    return NextResponse.redirect(new URL(area.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/learn/:path*", "/teach/:path*"],
};
