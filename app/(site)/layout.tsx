import { Footer } from "@/components/sections/footer";
import { SiteHeader } from "@/components/site-header";
import { newsreader, newsreaderExtended, publicSans } from "@/lib/fonts/site";
import { cn } from "@/lib/utils";

/**
 * The public site: everything anybody can read without an account. Its
 * caching is untouched by the learner area, which renders under its own
 * layout and never shares a page with these.
 *
 * The wrapper only carries the site's fonts (see `.scope-site`). It is
 * `display: contents`, so the header, main and footer stay children of the
 * body's column as far as layout is concerned.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={cn(publicSans.variable, newsreader.variable, newsreaderExtended.variable, "scope-site contents")}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
