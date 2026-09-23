import type { Metadata } from "next";

import { AuthShell } from "@/components/area/auth-shell";
import { LoginForm } from "@/components/area/login-form";

export const metadata: Metadata = { title: "Tutor sign in" };

export default async function TutorLoginPage({ searchParams }: PageProps<"/teach/login">) {
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Sign in to teach"
      lead="For tutors running a Capability Development Programme."
      footer={
        <p className="text-muted-foreground">
          Tutors are invited by the Antitect team. If you are here to take a programme rather than
          teach one, that sign-in is a separate one.
        </p>
      }
    >
      <LoginForm area="teach" next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
