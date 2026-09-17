import { cache } from "react";

import type { PersonBody } from "./schemas";
import { API_URL } from "./site";

/**
 * The only place this site talks to the API. Components never call fetch.
 *
 * Reads run on the server and are cached for 60 seconds. That is not a
 * nicety: the API allows 100 public reads per 15 minutes per IP, and the
 * server is one IP for every visitor. Posts and payment polling run in the
 * browser, so each visitor spends their own allowance rather than the site's.
 */

// ---------------------------------------------------------------------------
// Contract. Events as built in antitect-crm/apps/api/src/services/publicEvents.ts;
// programmes, checkout, quotes, payments and community as agreed on 2026-09-17
// with the CRM session building feat/programmes. Adding a field there is fine;
// renaming one breaks this.
// ---------------------------------------------------------------------------

export type EventType = "webinar" | "workshop";
export type EventFormat = "online" | "in_person";

export interface Venue {
  name: string;
  address: string;
}

export interface PublicEvent {
  title: string;
  slug: string;
  /** Plain text with newlines. Not Markdown, not HTML. */
  description: string;
  type: EventType;
  format: EventFormat;
  /** In person only. */
  venue: Venue | null;
  /** UTC instant. */
  startsAt: string;
  endsAt: string | null;
  /** Whole kobo. Zero is free and registers; anything else goes through checkout. */
  priceKobo: number;
  currency: "NGN";
  imageUrl: string | null;
  /** Null means unlimited, not zero. */
  capacity: number | null;
  spotsRemaining: number | null;
  isFull: boolean;
}

export interface ProgramProject {
  title: string;
  /** Plain text. */
  description: string;
}

/** One run of a Capability Development Programme. Each cohort is its own record, always online. */
export interface PublicProgram {
  title: string;
  slug: string;
  summary: string;
  /** Plain text with newlines. */
  description: string;
  projects: ProgramProject[];
  outcomes: string[];
  /** Null until the CRM records it; copy that needs a figure is left out rather than guessed. */
  durationWeeks: number | null;
  sessionsPerWeek: number | null;
  hoursPerSession: number | null;
  priceKobo: number;
  currency: "NGN";
  /** When the cohort starts. */
  startsAt: string | null;
  /** Null means enrolment closes at `startsAt`. */
  enrollmentClosesAt: string | null;
  enrollmentOpen: boolean;
  capacity: number | null;
  spotsRemaining: number | null;
  isFull: boolean;
  imageUrl: string | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type Channel = "email" | "whatsapp";

export interface RegistrationResponse {
  registrationId: string;
  channel: Channel;
  /** Masked, e.g. "a***@example.com". Null when there was nowhere to send. */
  sentTo: string | null;
  alreadyRegistered: boolean;
  event: { title: string; startsAt: string };
}

/**
 * A checkout either starts a payment, confirms outright (a discount made it
 * free, so there is nothing to pay), or says the place is already theirs.
 */
export type CheckoutResponse =
  | { reference: string; authorizationUrl: string; totalKobo: number; status: "pending" }
  | { reference: string; authorizationUrl: null; totalKobo: 0; status: "confirmed" }
  | { alreadyRegistered: true; channel: Channel; sentTo: string | null }
  | { alreadyEnrolled: true; channel: Channel; sentTo: string | null };

export interface Quote {
  priceKobo: number;
  discountKobo: number;
  totalKobo: number;
  currency: "NGN";
  code: string;
}

export interface PaymentStatus {
  /**
   * `received`: the money arrived but no place could be given (the last one went
   * to someone else, or they had already paid). The team refunds or contacts
   * them. Not a success, and not an error.
   */
  status: "pending" | "confirmed" | "received" | "failed";
  kind: "event" | "program";
  title: string;
  startsAt: string | null;
}

export interface CommunityResponse {
  alreadyMember: boolean;
}

export type FieldErrors = Record<string, string[]>;

interface ApiErrorBody {
  error: { message: string; code: string; details?: FieldErrors };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldErrors | undefined;

  constructor(status: number, code: string, message: string, details?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function readError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body.error) {
      const { code, message, details } = body.error;
      return new ApiError(response.status, code, message, details);
    }
  } catch {
    // Not the API's error shape, e.g. a proxy's HTML page. Fall through.
  }
  return new ApiError(response.status, "UNKNOWN", "Something went wrong. Please try again.");
}

// ---------------------------------------------------------------------------
// Server reads
// ---------------------------------------------------------------------------

const REVALIDATE_SECONDS = 60;
const READ_TIMEOUT_MS = 10_000;

/** Same rule the API applies, so a junk slug never costs an API read. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 80 && SLUG.test(slug);
}

function serverApiUrl(): string {
  // A private-network address when the host has one; otherwise the public URL.
  const internal = process.env.INTERNAL_API_URL?.replace(/\/+$/, "");
  return internal || API_URL;
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

async function read<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${serverApiUrl()}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new ApiError(0, "NETWORK", `Could not reach the API for ${path}: ${reason}`);
  }

  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

/**
 * A list read. Any failure throws, which during a background regeneration
 * keeps the last good page in place, so an API blip or a cold start does not
 * wipe a section for a minute. The exception is the build, where there is no
 * last good page and a sleeping API must not fail the deploy; the first
 * regeneration fills the section in.
 */
async function readList<T>(path: string, revalidate?: number): Promise<T[]> {
  try {
    return (await read<Page<T>>(path, revalidate)).items;
  } catch (error) {
    if (isBuildPhase()) {
      console.warn(`Building without ${path}:`, describe(error));
      return [];
    }
    throw error;
  }
}

/** One record by slug, or null when the API says it does not exist (drafts included). */
async function readOne<T>(path: string, slug: string): Promise<T | null> {
  if (!isValidSlug(slug)) return null;
  try {
    return await read<T>(`${path}/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

/** Published events that have not started, soonest first. Drafts and cancelled never appear. */
export const getUpcomingEvents = cache((limit: number = 25) =>
  readList<PublicEvent>(`/api/public/events?limit=${limit}`),
);

/** Includes past events: an old link still reads. Registration is what closes. */
export const getEvent = cache((slug: string) => readOne<PublicEvent>("/api/public/events", slug));

/** Published programmes, soonest cohort first. */
export const getPrograms = cache(() => readList<PublicProgram>("/api/public/programs?limit=25"));

export const getProgram = cache((slug: string) => readOne<PublicProgram>("/api/public/programs", slug));

/** For the sitemap, which can afford to be an hour stale. */
export async function getSitemapSlugs(): Promise<{ events: string[]; programs: string[] }> {
  const [events, programs] = await Promise.all([
    readList<PublicEvent>("/api/public/events?limit=100", 3600).catch(() => []),
    readList<PublicProgram>("/api/public/programs?limit=100", 3600).catch(() => []),
  ]);
  return { events: events.map((e) => e.slug), programs: programs.map((p) => p.slug) };
}

function describe(error: unknown): string {
  if (error instanceof ApiError) return `${error.status} ${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

// ---------------------------------------------------------------------------
// Browser calls
// ---------------------------------------------------------------------------

/** Long enough to outlast an API waking from sleep. */
const POST_TIMEOUT_MS = 60_000;

async function send<T>(method: "GET" | "POST", path: string, body?: unknown, timeoutMs = POST_TIMEOUT_MS): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "We could not reach our server.");
  }

  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

const segment = encodeURIComponent;

/**
 * Registers for a free event. Resolves on 201 and on 200 (already registered,
 * a success from their side). Safe to retry: the API treats a repeat as
 * `alreadyRegistered`.
 */
export function registerForEvent(slug: string, person: PersonBody): Promise<RegistrationResponse> {
  return send("POST", `/api/public/events/${segment(slug)}/register`, person);
}

export type Payable = { kind: "event" | "program"; slug: string };

function payablePath({ kind, slug }: Payable): string {
  return `/api/public/${kind === "event" ? "events" : "programs"}/${segment(slug)}`;
}

/** Starts payment for a priced event (checkout) or a programme (enroll). */
export function startPayment(
  payable: Payable,
  person: PersonBody,
  discountCode?: string,
): Promise<CheckoutResponse> {
  const action = payable.kind === "event" ? "checkout" : "enroll";
  return send("POST", `${payablePath(payable)}/${action}`, {
    ...person,
    ...(discountCode ? { discountCode } : {}),
  });
}

/** Prices a discount code before paying. Under the read limit, so only on request. */
export function getQuote(payable: Payable, code: string): Promise<Quote> {
  return send("GET", `${payablePath(payable)}/quote?code=${segment(code)}`, undefined, 15_000);
}

export function joinCommunity(person: PersonBody): Promise<CommunityResponse> {
  return send("POST", "/api/public/community", person);
}

/** What the API issues: "ANT-" and 24 lowercase hex characters. Anything else is not worth a request. */
export function isValidReference(reference: string): boolean {
  return /^ANT-[0-9a-f]{24}$/.test(reference);
}

/** Polled by the payment return page. Short timeout: another poll follows. */
export function getPaymentStatus(reference: string): Promise<PaymentStatus> {
  return send("GET", `/api/public/payments/${segment(reference)}/status`, undefined, 8_000);
}
