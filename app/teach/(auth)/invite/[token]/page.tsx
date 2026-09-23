import type { Metadata } from "next";

import { AuthShell } from "@/components/area/auth-shell";
import { PasswordForm } from "@/components/area/password-form";

export const metadata: Metadata = { title: "Set your password" };

/**
 * Where a tutor's invitation lands. They arrive this way or not at all: there
 * is no sign-up, because teaching a run is something the team assigns.
 */
export default async function TutorInvitePage({ params }: PageProps<"/teach/invite/[token]">) {
  const { token } = await params;

  return (
    <AuthShell
      title="Welcome to Antitect"
      lead="Choose a password, and your runs are waiting on the other side."
    >
      <PasswordForm area="teach" token={token} purpose="invite" />
    </AuthShell>
  );
}
