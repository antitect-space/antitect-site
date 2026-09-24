import type { Metadata } from "next";

import { AreaHeader } from "@/components/area/area-header";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Said out loud rather than left to fall out of reading a cookie. Nothing
 * behind a sign-in may be built ahead of time or cached, and a page that
 * became static because somebody moved a session read is exactly the kind of
 * mistake this declaration exists to prevent.
 */
export const dynamic = "force-dynamic";

/**
 * Everything behind a tutor's sign-in. Read per request, never cached, and
 * every page asks the API — teaching a run is what grants access to it, just
 * as enrolment does on the learner side.
 */
export default function TutorLayout({ children }: LayoutProps<"/teach">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <AreaHeader
        area="teach"
        label="Your runs"
        links={[
          { href: "/teach", label: "Dashboard" },
          { href: "/teach/review", label: "Review queue" },
        ]}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
