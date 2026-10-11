/**
 * Configuration and facts about the company, as opposed to page copy.
 * `NEXT_PUBLIC_*` values are inlined when the site is built, so they must be
 * set before `next build` runs.
 */

function withoutTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Canonical origin. Every og:url, og:image and sitemap entry is built from it. */
export const SITE_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5174",
);

/** The public API origin. The browser posts here. */
export const API_URL = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
);

export const SITE_NAME = "Antitect";

/** Under 160 characters. Location terms first: they are what people search for. */
export const SITE_DESCRIPTION =
  "Hands-on AI programmes in Lagos. Build real projects with instructor guidance — free webinars, workshops, and structured capability programmes.";

export const CONTACT = {
  email: "hello@antitect.org",
  phoneDisplay: "0915 765 2774",
  phoneHref: "tel:+2349157652774",
  /** A one-to-one chat with the team, from the current site. */
  whatsappChatUrl: "https://wa.me/2349133180239",
  address: {
    /** As it is written on the page. */
    display: "Abuja, Nigeria",
    locality: "Abuja",
    region: "Federal Capital Territory",
    country: "NG",
  },
} as const;

/**
 * The WhatsApp community invite, shown after someone joins through the form
 * and after they register for a free event. If it is ever emptied, the button
 * opens a chat with the team instead, so it is never a dead link.
 */
export const COMMUNITY_INVITE_URL = "https://chat.whatsapp.com/CgHdBJWmPtG03BI4mmJ6vs";

/** A chat with the team, opened with `text` already typed for them. */
export function whatsappChat(text: string): string {
  return `${CONTACT.whatsappChatUrl}?text=${encodeURIComponent(text)}`;
}

export function communityLink(): { href: string; label: string } {
  return COMMUNITY_INVITE_URL
    ? { href: COMMUNITY_INVITE_URL, label: "Join the WhatsApp community" }
    : { href: CONTACT.whatsappChatUrl, label: "Message us on WhatsApp" };
}

export interface NavLink {
  label: string;
  href: string;
}

/**
 * The three formats, deepest last, then the company. Webinars and workshops
 * get pages of their own in the redesign; until they exist, both lead to the
 * events list, which holds both.
 */
// TODO(redesign): point these at /webinars and /workshops once those pages exist.
const WEBINARS: NavLink = { label: "Webinars", href: "/events" };
const WORKSHOPS: NavLink = { label: "Workshops", href: "/events" };
const PROGRAMMES: NavLink = { label: "Capability development programmes", href: "/programmes" };
const ABOUT: NavLink = { label: "About", href: "/about" };

export const SIGN_IN: NavLink = { label: "Sign in", href: "/learn/login" };
export const CONTACT_LINK: NavLink = { label: "Contact", href: "/#contact" };
export const JOIN_FREE: NavLink = { label: "Join free", href: "/community" };

export const NAV: readonly NavLink[] = [WEBINARS, WORKSHOPS, PROGRAMMES, ABOUT];

/**
 * The footer's columns. Legal is left out until its pages exist: Privacy,
 * Terms and Refunds.
 */
// TODO(content): add a Legal group (Privacy, Terms, Refunds) once those pages exist.
export const FOOTER_NAV: ReadonlyArray<{ heading: string; links: readonly NavLink[] }> = [
  { heading: "Learn", links: [WEBINARS, WORKSHOPS, PROGRAMMES, { label: "Community", href: "/community" }] },
  { heading: "Company", links: [ABOUT, CONTACT_LINK, SIGN_IN] },
];

/**
 * Registration and social accounts, shown in the footer once they are
 * confirmed. Until then nothing is shown, rather than a placeholder.
 */
// TODO(content): the CAC RC number, and links to the social accounts that are active.
export const COMPANY: { cacNumber: string | null; socials: readonly NavLink[] } = {
  cacNumber: null,
  socials: [],
};

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
