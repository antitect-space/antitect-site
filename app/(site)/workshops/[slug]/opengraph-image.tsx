import { recapOf } from "@/content/recaps";
import { getEvent } from "@/lib/api";
import { formatDateLong } from "@/lib/format";
import { SHARE_SIZE, flyerForShare, renderShareImage } from "@/lib/share-image";

/**
 * A workshop's link preview (design "Share image · Workshop", and "With
 * flyer"): what WhatsApp shows when the page is shared. "Workshop", the
 * title, the date and where; the flyer beside them when there is one. A
 * recap's preview names the workshop, where it was and when. Never a price.
 */

export const alt = "A workshop from Antitect";
export const size = SHARE_SIZE;
export const contentType = "image/png";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const recap = recapOf(slug);
  if (recap) {
    return renderShareImage({ label: "Workshop", title: recap.name, when: `${recap.date} · ${recap.place}` });
  }

  const event = await getEvent(slug);
  if (!event || event.type !== "workshop") {
    return renderShareImage({ label: "Workshops", title: "A day building something that works", when: null });
  }

  // The CRM has no area for a venue, so its name stands in for "[Area]".
  const where = event.format === "in_person" ? (event.venue?.name ?? null) : "Online";
  return renderShareImage({
    label: "Workshop",
    title: event.title,
    when: [formatDateLong(event.startsAt), where].filter(Boolean).join(" · "),
    flyer: await flyerForShare(event.imageUrl),
  });
}
