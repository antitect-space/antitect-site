import type { Metadata } from "next";

import { AuthShell } from "@/components/learner/auth-shell";
import { ForgotForm } from "@/components/learner/forgot-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Reset your password"
      lead="Tell us the address you enrolled with and we will send a link."
    >
      <ForgotForm />
    </AuthShell>
  );
}
