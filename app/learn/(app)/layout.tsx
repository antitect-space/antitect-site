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
      <AreaHeader
        area="learn"
        label="Your programme"
        links={[
          { href: "/learn", label: "Dashboard" },
          { href: "/learn/schedule", label: "Schedule" },
          { href: "/learn/projects", label: "Projects" },
          { href: "/learn/reviews", label: "Reviews" },
        ]}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
