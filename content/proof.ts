/**
 * Workshop 001: the proof Antitect has. Its place and date are the record of
 * an event that has happened, kept here because the CRM's lists only ever
 * return what is still to come.
 *
 * The figures and quotes are still being collected. Each stays `null` (or
 * empty) until it is confirmed, and whatever needs it is not rendered until
 * then: no "[N] people" ever reaches the page.
 */

export interface ProofQuote {
  quote: string;
  built: string;
  name: string;
  role: string;
}

export const workshop001 = {
  name: "Workshop 001",
  place: "Lagos",
  date: "1 August 2026",
  /** The section the hero's "See inside" scrolls to. */
  anchor: "workshop-001",
  title: "Workshop 001: a full room, building.",
  /** Follows the headcount, and only shows with it. */
  leadAfterHeadcount: "people paid to spend a day building AI automations, with instructors working the room.",
  // TODO(content): how many people attended Workshop 001.
  people: null as number | null,
  // TODO(content): how many working builds people left with.
  builds: null as number | null,
  days: 1,
  // TODO(content): two quotes from attendees: what they built, and whether it still runs.
  quotes: [] as ProofQuote[],
  recap: { label: "See the Workshop 001 recap", href: "/workshops/workshop-001" } as { label: string; href: string } | null,
};
