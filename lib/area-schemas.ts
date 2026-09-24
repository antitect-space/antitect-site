import { z } from "zod";

/**
 * What a sign-in form checks before spending a round trip.
 *
 * The password rule is the API's, mirrored here character for character —
 * same checks, same order, same words — so the two can only ever agree. It is
 * copied rather than fetched: a rule that changes about once a year is not
 * worth a request on every page, and a wrong copy announces itself the first
 * time the API refuses something this accepted.
 *
 * It lives in antitect-crm/apps/api/src/schemas/learner.ts, and applies to
 * tutors as well as learners. If you change one, change the other.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address."));

/**
 * Eight characters with a letter, a number and a symbol.
 *
 * Unicode-aware on purpose: `\p{N}` rather than `\d`, so a number that is not
 * an ASCII digit still counts, and a symbol is anything that is not a letter,
 * a number or whitespace. A space is allowed in a password but is not a
 * symbol. Anything stricter here would refuse a password the API accepts.
 */
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .refine((value) => /\p{L}/u.test(value), "Include at least one letter.")
  .refine((value) => /\p{N}/u.test(value), "Include at least one number.")
  .refine(
    (value) => /[^\p{L}\p{N}\s]/u.test(value),
    "Include at least one symbol, such as ! or #.",
  )
  .max(200, "That is longer than a password needs to be.");

/** What the hint under the field says. One sentence, and the same rule. */
export const PASSWORD_HINT = "At least 8 characters, with a letter, a number and a symbol.";

/**
 * Signing in checks only that something was typed.
 *
 * A password set under an older rule still works — the rule is applied when a
 * password is set, never when it is used — and a sign-in form that enforced
 * today's rule would lock out the very people it was meant to protect.
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const forgotSchema = z.object({ email });

/** Setting a password, whether from an invitation or a reset. */
export const passwordSchema = z.object({ password });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
