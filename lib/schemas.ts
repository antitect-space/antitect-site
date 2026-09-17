import { z } from "zod";

/**
 * Duplicated from antitect-crm/apps/api/src/routes/public.ts (there is no
 * shared package). Keep it short: a field change means editing both repos.
 *
 * One person, the same everywhere: registering for an event, paying for one,
 * enrolling in a programme, joining the community. The API requires email and
 * phone for all of them; the phone is the WhatsApp number, since reminders can
 * go there.
 */

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const personSchema = z.object({
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
  /** Consent to be messaged on WhatsApp. Recorded, never required. */
  whatsappOptIn: z.boolean(),
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
  "whatsappOptIn",
] as const satisfies ReadonlyArray<keyof PersonInput>;

export type PersonField = (typeof PERSON_FIELDS)[number];

export const EMPTY_PERSON: PersonInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  whatsappOptIn: false,
};
