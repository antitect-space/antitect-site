import { getProgram } from "@/lib/api";
import { formatDay } from "@/lib/format";
import { isDraft, isUnderWay, runName } from "@/lib/programs";
import { SHARE_SIZE, flyerForShare, renderShareImage } from "@/lib/share-image";

/**
 * A programme's link preview (design "Share image · Programme", and "With
 * flyer"): what WhatsApp shows when the page is shared. "Capability
 * development programme", the title, and the run and its start, each only
 * with its figure; the flyer beside them when there is one. Never a price.
 */

export const alt = "A capability development programme from Antitect";
export const size = SHARE_SIZE;
export const contentType = "image/png";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);

  if (!program) {
    return renderShareImage({ label: "Capability development programmes", title: "Become able to do it on your own", when: null });
  }

  const draft = isDraft(program);
  const starts =
    !draft && program.startsAt && !isUnderWay(program) ? `Starts ${formatDay(program.startsAt)}` : null;
  const when = [draft ? "Waitlist open" : runName(program), starts].filter(Boolean).join(" · ");

  return renderShareImage({
    label: "Capability development programme",
    title: program.title,
    when: when || null,
    flyer: await flyerForShare(program.imageUrl),
  });
}
