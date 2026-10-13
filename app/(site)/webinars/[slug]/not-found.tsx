import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { webinarPage } from "@/content/webinars";

/**
 * A webinar the API does not know, or no longer shows (design "Webinar ·
 * Not available"). It never says which: cancelled and unpublished read the
 * same.
 */
export default function WebinarNotFound() {
  const { title, primary, secondary } = webinarPage.notAvailable;
  return (
    <div className="container-site flex flex-col gap-8 pt-16 pb-24 lg:gap-10 lg:pt-32 lg:pb-44">
      <h1 className="type-h1 max-w-[760px] text-ink">{title}</h1>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-8">
        <Button asChild variant="secondary" size="lg" className="px-5">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        <Button asChild variant="text">
          <Link href={secondary.href}>
            {secondary.label}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
