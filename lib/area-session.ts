import { cookies, headers } from "next/headers";

import type { Area } from "./area";

/**
 * A signed-in session, as this site holds it.
 *
 * The API issues the token and is the only thing that can read it. This site
 * carries it in a cookie of its own, on its own origin, for one reason: while
 * the site and the API live on different domains, a cookie set by the API is a
 * third-party cookie, and Safari and Brave throw those away. A first-party
 * cookie here works in every browser today and keeps working unchanged once
 * both are on antitect.org.
 *
 * The token never reaches client JavaScript. The browser talks to
 * `/api/<area>/*` on this origin; everything else is server-to-server.
 */

/** Seven days, which is what the API issues unless it has been told otherwise. */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;

/** The token, or null. Reading it renders the caller per request, which every signed-in page does. */
export async function sessionToken(area: Area): Promise<string | null> {
  const store = await cookies();
  return store.get(area.cookie)?.value || null;
}

/** The header the API expects the token in. */
export function sessionCookieHeader(area: Area, token: string): string {
  return `${area.apiCookie}=${token}`;
}

/**
 * The session out of a `Set-Cookie` the API sent us, or null when it sent
 * none. An empty value is how a logout arrives, and is treated as a clearance.
 *
 * Its `Max-Age` comes back too, and this site's cookie is set to match: a
 * cookie that outlives the token inside it means somebody looks signed in
 * right up until the first page refuses to load.
 */
export function sessionFromSetCookie(
  area: Area,
  responseHeaders: Headers,
): { value: string; maxAge: number | null } | null {
  for (const cookie of responseHeaders.getSetCookie()) {
    const [pair, ...attributes] = cookie.split(";");
    const separator = pair?.indexOf("=") ?? -1;
    if (!pair || separator < 0) continue;
    if (pair.slice(0, separator).trim() !== area.apiCookie) continue;

    const maxAge = attributes
      .map((attribute) => attribute.trim().match(/^max-age=(-?\d+)$/i))
      .find(Boolean);

    return { value: pair.slice(separator + 1).trim(), maxAge: maxAge ? Number(maxAge[1]) : null };
  }
  return null;
}

/**
 * Who the request is really from.
 *
 * Every signed-in request reaches the API from this server, so the API sees
 * one address for a whole cohort. These two headers hand it the visitor's
 * address back, proven by a shared secret — without the secret the API ignores
 * them, which is exactly what should happen to a header a stranger can set.
 *
 * Not `X-Forwarded-For`: the host's own proxy appends to that, so the API
 * could not tell which hop was the visitor.
 */
export function clientHeaders(clientIp: string | null): Record<string, string> {
  const secret = process.env.LEARNER_PROXY_SECRET;
  if (!secret || !clientIp) return {};
  return { "X-Antitect-Proxy-Secret": secret, "X-Antitect-Client-IP": clientIp };
}

/** The first address in the forwarding chain: the visitor, before any proxy. */
export function firstForwardedFor(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

/** The visitor's address, from inside a server component or page. */
export async function visitorIp(): Promise<string | null> {
  const store = await headers();
  return firstForwardedFor(store.get("x-forwarded-for")) ?? store.get("x-real-ip");
}
