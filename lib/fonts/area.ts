import { Archivo } from "next/font/google";

/**
 * The learner and tutor areas keep the type they launched with until they are
 * redesigned themselves. A module of its own, so the public site never
 * preloads it.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
