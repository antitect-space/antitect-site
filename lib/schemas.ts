import { z } from "zod";

import { OUTSIDE_NIGERIA, isNigerianState } from "./locations";

/**
 * Duplicated from antitect-crm/apps/api/src/routes/public.ts (there is no
 * shared package). Keep it short: a field change means editing both repos.
 *
 * One person, the same everywhere: registering for an event, paying for one,
 * enrolling in a programme, joining the community. The API requires email and
 * phone for all of them; the phone is the WhatsApp number, since reminders can
 * go there.
 *
 * Location is required here though optional in the API: a Nigerian state, or
 * "Outside Nigeria" with the country typed in. It is posted as `state` plus
 * `country`, with the country "Nigeria" whenever a state was picked.
 */

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const personSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter a first name.").max(120),
    lastName: optionalText,
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Enter an email address.")
      .pipe(z.email("Enter a valid email address.")),
    // The API normalises to E.164 and is the real judge. This only catches
    // something that is plainly not a phone number before a slow round trip.
    phone: z
      .string()
      .trim()
      .min(1, "Enter a WhatsApp number.")
      .max(32)
      .refine(
        (value) => /^\+?[\d\s()-]+$/.test(value) && value.replace(/\D/g, "").length >= 7,
        "Enter a valid WhatsApp number.",
      ),
    /** A state from the list, or OUTSIDE_NIGERIA. */
    state: z
      .string()
      .refine(
        (value) => value === OUTSIDE_NIGERIA || isNigerianState(value),
        "Choose your state, or Outside Nigeria.",
      ),
    /** Only read when the state is OUTSIDE_NIGERIA. */
    country: z.string().trim().max(80),
    /** Consent to be messaged on WhatsApp. Recorded, never required. */
    whatsappOptIn: z.boolean(),
  })
  .superRefine((person, ctx) => {
    if (person.state === OUTSIDE_NIGERIA && person.country === "") {
      ctx.addIssue({ code: "custom", path: ["country"], message: "Enter your country." });
    }
  })
  .transform(({ state, country, ...person }) => {
    const outside = state === OUTSIDE_NIGERIA;
    // An undefined state is left out of the JSON body entirely.
    return { ...person, state: outside ? undefined : state, country: outside ? country : "Nigeria" };
  });

/** What a form holds while it is being filled in. */
export type PersonInput = z.input<typeof personSchema>;

/** What is posted to the API. */
export type PersonBody = z.output<typeof personSchema>;

export const PERSON_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "state",
  "country",
  "whatsappOptIn",
] as const satisfies ReadonlyArray<keyof PersonInput>;

export type PersonField = (typeof PERSON_FIELDS)[number];

export const EMPTY_PERSON: PersonInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",
  country: "",
  whatsappOptIn: false,
};
