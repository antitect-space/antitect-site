import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/area/auth-shell";
import { LoginForm } from "@/components/area/login-form";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Reading `next` makes this render per request, which every page under
 * `/learn` does anyway. It is where somebody was headed before they were
 * asked to sign in, and `safeNext` refuses anything outside the learner area.
 */
export default async function LoginPage({ searchParams }: PageProps<"/learn/login">) {
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Sign in"
      lead="For learners on a Capability Development Programme."
      footer={
        <p className="text-muted-foreground">
          Enrolled but never set a password? Use the link in your invitation email, or{" "}
          <Link href="/learn/forgot" className="underline underline-offset-4 hover:no-underline">
            ask for a new one
          </Link>
          .
        </p>
      }
    >
      <LoginForm area="learn" next={typeof next === "string" ? next : undefined} />
    </AuthShell>
  );
}
