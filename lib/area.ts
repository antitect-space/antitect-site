/**
 * The two signed-in areas of this site, and everything that differs between
 * them.
 *
 * A learner takes a programme; a tutor teaches one. They are separate accounts
 * in separate collections with separate signing keys — two doors, not one door
 * with two keys — and one person may hold both, on the same email address. So
 * the cookies must differ: same name, and signing into one would sign them out
 * of the other.
 *
 * Everything else about the two is the same act: post a password to this site,
 * get a session, read your own data. That machinery lives in `area-session`,
 * `area-api`, `area-client` and `components/area`, and takes one of these as
 * its argument. Adding an area should be this file plus its pages.
 */

import { AREA_HOME, type AreaName } from "./area-view";

export type { AreaName } from "./area-view";

export interface Area {
  readonly name: AreaName;
  /** Ours, on this site's origin. Never the API's name. */
  readonly cookie: string;
  /** The cookie the API sets, which carries the token we hand back to it. */
  readonly apiCookie: string;
  /** Where this area's routes live on the API. */
  readonly apiBase: string;
  /** Where its pages live here. */
  readonly home: string;
  /** Reachable without a session: where somebody goes to get one. */
  readonly publicPages: ReadonlySet<string>;
  readonly publicPrefixes: readonly string[];
  /**
   * What a browser may post through `/api/<area>/*`, and with which method.
   * A closed list on purpose: an open relay to the API would be a way around
   * every rule the API enforces on its own routes.
   */
  readonly allowed: ReadonlyArray<{ method: string; path: RegExp }>;
  /** The paths that are supposed to come back carrying a session. */
  readonly sessionGranting: ReadonlySet<string>;
}

const AUTH_PATHS = /^auth\/(login|logout|forgot|reset|accept-invite|resend-invite)$/;

/** Sending work in. Ids are opaque to this site, so the shape is all it checks. */
const LEARNER_SUBMISSIONS = /^programs\/[\w-]{1,64}\/projects\/[\w-]{1,64}\/submissions$/;
/** Booking a Project Review Session, and cancelling one's own. */
const LEARNER_BOOK = /^programs\/[\w-]{1,64}\/reviews$/;
const LEARNER_CANCEL = /^reviews\/[\w-]{1,64}\/cancel$/;

/** Claiming a submission, and deciding it. */
const TUTOR_REVIEW = /^submissions\/[\w-]{1,64}\/(start-review|decision)$/;
/** Opening time for Project Review Sessions, closing it, and cancelling a booking. */
const TUTOR_OPEN_WINDOW = /^programs\/[\w-]{1,64}\/review-windows$/;
const TUTOR_CLOSE_WINDOW = /^review-windows\/[\w-]{1,64}$/;
const TUTOR_CANCEL_BOOKING = /^reviews\/[\w-]{1,64}\/cancel$/;

const SESSION_GRANTING = new Set(["auth/login", "auth/accept-invite", "auth/reset"]);

export const AREAS: Readonly<Record<AreaName, Area>> = {
  learn: {
    name: "learn",
    cookie: "antitect_learn_session",
    apiCookie: process.env.LEARNER_API_COOKIE ?? "antitect_learner",
    apiBase: "/api/learner",
    home: AREA_HOME.learn,
    publicPages: new Set(["/learn/login", "/learn/forgot"]),
    publicPrefixes: ["/learn/invite/", "/learn/reset/"],
    allowed: [
      { method: "POST", path: AUTH_PATHS },
      { method: "POST", path: LEARNER_SUBMISSIONS },
      { method: "POST", path: LEARNER_BOOK },
      { method: "POST", path: LEARNER_CANCEL },
    ],
    sessionGranting: SESSION_GRANTING,
  },
  teach: {
    name: "teach",
    cookie: "antitect_teach_session",
    apiCookie: process.env.TUTOR_API_COOKIE ?? "antitect_tutor",
    apiBase: "/api/tutor",
    home: AREA_HOME.teach,
    publicPages: new Set(["/teach/login", "/teach/forgot"]),
    publicPrefixes: ["/teach/invite/", "/teach/reset/"],
    allowed: [
      { method: "POST", path: AUTH_PATHS },
      { method: "POST", path: TUTOR_REVIEW },
      { method: "POST", path: TUTOR_OPEN_WINDOW },
      { method: "DELETE", path: TUTOR_CLOSE_WINDOW },
      { method: "POST", path: TUTOR_CANCEL_BOOKING },
    ],
    sessionGranting: SESSION_GRANTING,
  },
};

export const LEARN = AREAS.learn;
export const TEACH = AREAS.teach;

/** Which area a page path belongs to, or null for the public site. */
export function areaForPath(pathname: string): Area | null {
  for (const area of Object.values(AREAS)) {
    if (pathname === area.home || pathname.startsWith(`${area.home}/`)) return area;
  }
  return null;
}

export function isPublicPage(area: Area, pathname: string): boolean {
  return (
    area.publicPages.has(pathname) ||
    area.publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}

export function mayForward(area: Area, method: string, path: string): boolean {
  return area.allowed.some((rule) => rule.method === method && rule.path.test(path));
}
