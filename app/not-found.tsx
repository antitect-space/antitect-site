import Link from "next/link";

import { Footer } from "@/components/sections/footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

/**
 * A URL that matches nothing at all, which is the one page that renders
 * outside both areas of the site. It carries its own header and footer because
 * there is no layout above it to supply them — and somebody who mistyped a
 * link should still land somewhere they can navigate from.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="container-page py-20 lg:py-28">
          <h1 className="text-display text-4xl sm:text-5xl">This page does not exist.</h1>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link href="/">Go to the home page</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
