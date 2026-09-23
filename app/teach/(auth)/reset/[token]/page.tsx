import type { Metadata } from "next";

import { AuthShell } from "@/components/area/auth-shell";
import { PasswordForm } from "@/components/area/password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function TutorResetPage({ params }: PageProps<"/teach/reset/[token]">) {
  const { token } = await params;

  return (
    <AuthShell title="Choose a new password" lead="Then we will sign you straight in.">
      <PasswordForm area="teach" token={token} purpose="reset" />
    </AuthShell>
  );
}
