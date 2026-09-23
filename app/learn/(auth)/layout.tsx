import type { Metadata } from "next";

/**
 * The way in. Nothing here is ever cached or indexed: these pages exist to
 * take a password and hand back a session.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Nothing under `/learn` is prerendered, this page included. It holds no
 * learner data and could be static, but "no page under /learn was built ahead
 * of time" is a rule worth being able to check at a glance in the route table.
 */
export const dynamic = "force-dynamic";

export default function LearnerAuthLayout({ children }: LayoutProps<"/learn">) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
