import type { Metadata } from "next";

import { AuthShell } from "@/components/area/auth-shell";
import { PasswordForm } from "@/components/area/password-form";

export const metadata: Metadata = { title: "Set your password" };

/**
 * Where an invitation email lands. The token is only ever judged by the API,
 * when the password is submitted: there is no endpoint that says whether a
 * token is good, and one would be a way to test tokens without using them.
 */
export default async function InvitePage({ params }: PageProps<"/learn/invite/[token]">) {
  const { token } = await params;

  return (
    <AuthShell
      title="Welcome to Antitect"
      lead="Choose a password, and you are in. You will use it every time you come back."
    >
      <PasswordForm area="learn" token={token} purpose="invite" />
    </AuthShell>
  );
}
