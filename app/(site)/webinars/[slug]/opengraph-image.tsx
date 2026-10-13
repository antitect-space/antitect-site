import { getEvent } from "@/lib/api";
import { isPaid } from "@/lib/events";
import { formatDateLong, formatTimeRange } from "@/lib/format";
import { SHARE_SIZE, flyerForShare, renderShareImage } from "@/lib/share-image";

/**
 * A webinar's link preview (design W10, and "Share image · With flyer"):
 * what WhatsApp shows when the page is shared. The format, the title and
 * when it starts, in WAT; the flyer beside them when there is one. Never a
 * price.
 */

export const alt = "A webinar from Antitect";
export const size = SHARE_SIZE;
export const contentType = "image/png";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event || event.type !== "webinar") {
    return renderShareImage({ label: "Free webinars", title: "Live sessions on practical AI", when: null });
  }

  return renderShareImage({
    label: isPaid(event) ? "Webinar" : "Free webinar",
    title: event.title,
    // The start only, kept on one line: "10:00 am WAT".
    when: `${formatDateLong(event.startsAt)} · ${formatTimeRange(event.startsAt)}`,
    flyer: await flyerForShare(event.imageUrl),
  });
}
