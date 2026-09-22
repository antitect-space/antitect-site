import type { Metadata } from "next";

import { LearnerHeader } from "@/components/learner/learner-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Everything behind the sign-in. Each page reads the learner's own data per
 * request; nothing under here is ever cached or prerendered, and nothing it
 * does changes how the public pages are.
 */
export default function LearnerLayout({ children }: LayoutProps<"/learn">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <LearnerHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
