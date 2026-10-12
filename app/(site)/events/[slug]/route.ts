import { notFound } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

import { getEvent } from "@/lib/api";
import { eventHref } from "@/lib/events";

/**
 * An old event link: /events/{slug}. Every confirmation, reminder and WhatsApp
 * message sent before the split into webinars and workshops carries one, so
 * they must keep working. The event is read (cached like every other read) to
 * learn its type, and the visitor is sent on with a real 308, which browsers
 * and search engines both remember. An event the API does not know is a 404.
 *
 * A route handler rather than a page: a page that redirects while streaming
 * can only manage a redirect in the browser, not a status code.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  return NextResponse.redirect(new URL(eventHref(event), request.url), 308);
}
