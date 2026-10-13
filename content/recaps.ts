import type { PhotoId } from "@/content/gallery";
import { workshop001, type ProofQuote } from "@/content/proof";

/**
 * Workshop recaps, added to the site by hand rather than from the CRM (design
 * C11): a workshop that has happened, with its photographs and what people
 * built. Each is keyed by the slug its page lives at, /workshops/{slug}.
 *
 * Workshop 001 reads its facts from content/proof.ts, so the home page and
 * the recap cannot disagree. Figures and quotes still being collected stay
 * null or empty there, and whatever needs them is not rendered.
 */

export interface Recap {
  slug: string;
  name: string;
  /** The city it was held in: it names the event's venue, so it may appear. */
  place: string;
  /** "1 August 2026". */
  date: string;
  /** For <time>, and to put the newest first. */
  dateTime: string;
  /** Follows the headcount, and shows only with it. */
  leadAfterHeadcount: string;
  people: number | null;
  builds: number | null;
  days: number;
  quotes: readonly ProofQuote[];
  /** The gallery, in the design's three rows. */
  gallery: readonly (readonly PhotoId[])[];
  /** The recap card's three: one large, two small. */
  card: readonly [PhotoId, PhotoId, PhotoId];
  /** The strip on a workshop's page, under "See a past workshop". */
  strip: readonly [PhotoId, PhotoId, PhotoId];
}

export const recaps: readonly Recap[] = [
  {
    slug: "workshop-001",
    name: workshop001.name,
    place: workshop001.place,
    date: workshop001.date,
    dateTime: "2026-08-01",
    leadAfterHeadcount: "people spent a day building AI automations, with instructors working the room.",
    people: workshop001.people,
    builds: workshop001.builds,
    days: workshop001.days,
    quotes: workshop001.quotes,
    gallery: [["full-room"], ["facilitators", "over-shoulder"], ["building", "banner"]],
    card: ["full-room", "facilitators", "over-shoulder"],
    strip: ["building", "over-shoulder", "full-room"],
  },
];

export function recapOf(slug: string): Recap | null {
  return recaps.find((recap) => recap.slug === slug) ?? null;
}

/** The recaps, newest first. */
export function recapsNewestFirst(): Recap[] {
  return [...recaps].sort((a, b) => b.dateTime.localeCompare(a.dateTime));
}

export const recapPage = {
  built: "What people built",
  description: "A full room of people building AI automations for a day, with instructors working the room.",
  side: {
    next: "Next workshop",
    none: "Hear when the next one opens",
  },
} as const;
