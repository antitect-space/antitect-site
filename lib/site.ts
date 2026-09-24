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
  whatsappChatUrl: "https://wa.me/message/E7UM7E5LZ4RBJ1",
  address: {
    /** As it is written on the page. */
    display: "Abuja, Nigeria",
    locality: "Abuja",
    region: "Federal Capital Territory",
    country: "NG",
  },
} as const;

/**
 * The WhatsApp community invite, shown after someone joins through the form.
 * TODO(content): the real chat.whatsapp.com invite link. While it is empty the
 * button opens a chat with the team instead, so it is never a dead link.
 */
export const COMMUNITY_INVITE_URL = "";

export function communityLink(): { href: string; label: string } {
  return COMMUNITY_INVITE_URL
    ? { href: COMMUNITY_INVITE_URL, label: "Join the WhatsApp community" }
    : { href: CONTACT.whatsappChatUrl, label: "Message us on WhatsApp" };
}

export const NAV = [
  { label: "Programmes", href: "/programmes" },
  { label: "Events", href: "/events" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
] as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
