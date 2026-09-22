import type { Metadata } from "next";

import { AuthShell } from "@/components/learner/auth-shell";
import { PasswordForm } from "@/components/learner/password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage({ params }: PageProps<"/learn/reset/[token]">) {
  const { token } = await params;

  return (
    <AuthShell title="Choose a new password" lead="Then we will sign you straight in.">
      <PasswordForm token={token} purpose="reset" />
    </AuthShell>
  );
}
