import { z } from "zod";

/**
 * What the learner's forms check before spending a round trip. Nothing more:
 * the API owns the password rules and says what they are in `details.password`
 * when a password is refused, so guessing them here would only be a second
 * answer to disagree with.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address."));

/** The API's own minimum, so a password it will refuse is never worth a round trip. */
const password = z.string().min(10, "Use at least 10 characters.").max(200);

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
