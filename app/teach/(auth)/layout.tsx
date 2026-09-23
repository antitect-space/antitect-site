import type { Metadata } from "next";

/**
 * The way in for a tutor. Its own sign-in, not the learner's with a role check
 * on top: the two are separate accounts in separate collections, and a person
 * who is both holds two of them.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Nothing in a signed-in area is prerendered, these pages included. */
export const dynamic = "force-dynamic";

export default function TutorAuthLayout({ children }: LayoutProps<"/teach">) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
