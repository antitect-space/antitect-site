/**
 * The part of an area a browser is allowed to know: which one it is, and where
 * its pages live. Nothing else.
 *
 * It is a module of its own because everything else about an area — cookie
 * names, the API's paths, what the proxy will forward — is the server's
 * business, and some of it cannot cross into client code at all: a `RegExp` or
 * a `Set` handed to a client component is a runtime error, which is how this
 * separation came to be written down rather than assumed.
 */

export type AreaName = "learn" | "teach";

export const AREA_HOME: Record<AreaName, string> = {
  learn: "/learn",
  teach: "/teach",
};

export function isAreaName(value: string): value is AreaName {
  return value === "learn" || value === "teach";
}

/** Where to go after signing in: somewhere inside this area, and nowhere else. */
export function safeNext(area: AreaName, next: string | null | undefined): string {
  const home = AREA_HOME[area];
  if (!next || next.startsWith("//") || !next.startsWith(home)) return home;
  return next;
}
