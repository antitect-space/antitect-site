/**
 * Every time the API sends is a UTC instant. It is shown in Lagos time with
 * the zone named, because the audience spans several African timezones and a
 * bare "10am" is read as local time by everybody outside Lagos.
 *
 * Mirrors antitect-crm/apps/api/src/lib/lagos.ts so the page and the
 * confirmation email say the same thing.
 */
const TIME_ZONE = "Africa/Lagos";

export const TIME_ZONE_LABEL = "West Africa Time";
export const TIME_ZONE_SHORT = "WAT";

const dateLong = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateShort = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});

const dateNoWeekday = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export interface EventWhen {
  /** "Saturday, 12 September 2026" */
  date: string;
  /** "10:00 am – 12:00 pm West Africa Time" */
  time: string;
}

/**
 * The full date and time for a detail page. An end on the same day becomes a
 * range; an end on another day is written out, since "10am – 2pm" would lie.
 */
export function formatEventWhen(startsAt: string, endsAt: string | null = null): EventWhen {
  const start = new Date(startsAt);
  const date = dateLong.format(start);

  if (!endsAt) return { date, time: `${timeOnly.format(start)} ${TIME_ZONE_LABEL}` };

  const end = new Date(endsAt);
  if (dayKey.format(start) === dayKey.format(end)) {
    return { date, time: `${timeOnly.format(start)} – ${timeOnly.format(end)} ${TIME_ZONE_LABEL}` };
  }
  return {
    date,
    time: `${timeOnly.format(start)} ${TIME_ZONE_LABEL}, until ${dateShort.format(end)}, ${timeOnly.format(end)}`,
  };
}

/** "Wed 23 Sep · 10:00 am WAT", for cards and panels. */
export function formatShortWhen(startsAt: string): string {
  const start = new Date(startsAt);
  return `${dateShort.format(start)} · ${timeOnly.format(start)} ${TIME_ZONE_SHORT}`;
}

/** "12 October 2026", for a cohort start. */
export function formatDay(instant: string): string {
  return dateNoWeekday.format(new Date(instant));
}

export function hasStarted(startsAt: string, now: number = Date.now()): boolean {
  return new Date(startsAt).getTime() <= now;
}

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * "₦100,000". The API sends whole kobo; naira only exists on screen. Never
 * put the result in a meta description or share image: those are cached long
 * after a price changes.
 */
export function formatKobo(kobo: number): string {
  return naira.format(kobo / 100);
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/** Words for small counts in running copy ("three live sessions"), digits beyond ten. */
export function countWord(n: number): string {
  return Number.isInteger(n) && n >= 0 && n <= 10 ? NUMBER_WORDS[n]! : String(n);
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/**
 * A share-preview description: whitespace collapsed, cut on a word boundary
 * near `max` characters. Plain text in, plain text out; escaping is the
 * Metadata API's job.
 */
export function summarise(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;

  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[\s.,;:!?-]+$/, "")}…`;
}

/** The first paragraph of an admin-authored description. */
export function firstParagraph(text: string): string {
  return text.split(/\n\s*\n/)[0]?.trim() ?? "";
}

// ---------------------------------------------------------------------------
// The ticket
// ---------------------------------------------------------------------------

const dayNumber = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric" });
const monthShort = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, month: "short" });
const weekdayShort = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, weekday: "short" });

export interface TicketDate {
  /** "19" */
  day: string;
  /** "Sep" */
  month: string;
  /** "Sat · 10:00 am WAT" */
  when: string;
}

/** The stub's date, always rendered on the server so the ticket is right without JavaScript. */
export function ticketDate(startsAt: string): TicketDate {
  const at = new Date(startsAt);
  return {
    day: dayNumber.format(at),
    month: monthShort.format(at),
    when: `${weekdayShort.format(at)} · ${timeOnly.format(at)} ${TIME_ZONE_SHORT}`,
  };
}

/**
 * "In 3 days", "Tomorrow", "Today · starts 10:00 am", "Happening now", or null
 * once it is over.
 *
 * Only ever called in the browser: a label rendered on the server goes stale
 * inside the cache, and a page cached at noon would still say "Tomorrow" the
 * next morning. Today and tomorrow are decided in Lagos, not in the visitor's
 * timezone, because that is where the event is.
 */
export function relativeLabel(startsAt: string, now: number, graceMs: number): string | null {
  const start = new Date(startsAt).getTime();

  if (start <= now) return now - start <= graceMs ? "Happening now" : null;

  const days = lagosDaysBetween(now, start);
  if (days === 0) return `Today · starts ${timeOnly.format(new Date(start))}`;
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

const lagosDayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Whole days between two instants, counted by Lagos calendar date. */
function lagosDaysBetween(from: number, to: number): number {
  const a = Date.parse(`${lagosDayKey.format(new Date(from))}T00:00:00Z`);
  const b = Date.parse(`${lagosDayKey.format(new Date(to))}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * The first sentence of an admin-authored description, for the ticket's one
 * line. Never invented: when there is no description there is no line.
 */
export function firstSentence(text: string, max = 90): string | null {
  const flat = firstParagraph(text).replace(/\s+/g, " ").trim();
  if (!flat) return null;

  const end = flat.search(/[.!?](\s|$)/);
  const sentence = end > 0 ? flat.slice(0, end + 1) : flat;
  return sentence.length > max ? summarise(sentence, max) : sentence;
}
