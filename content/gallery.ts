/**
 * Workshop 001, Lagos, 1 August 2026. The only photographs on the site that
 * are ours, and the only proof that matters: people came and built something.
 *
 * These are WhatsApp copies, so `width` and `height` are their real pixel
 * sizes and nothing may be displayed larger — upscaling makes them visibly
 * soft. The people in them are identifiable: consent to appear in marketing
 * must be confirmed before launch.
 */
export type PhotoId = "building" | "over-shoulder" | "full-room" | "facilitators" | "banner";

export interface Photo {
  id: PhotoId;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Where to hold the crop when the tile is a different shape. */
  position: string;
}

const dir = "/images/workshop-001";

export const workshopPhotos: Photo[] = [
  {
    id: "building",
    src: `${dir}/antitect-workshop-001-building.jpg`,
    alt: "A woman working on a laptop in the foreground, with a full room of attendees and a presentation on screen behind her, at Antitect's first workshop in Lagos.",
    width: 1080,
    height: 810,
    position: "center",
  },
  {
    id: "over-shoulder",
    src: `${dir}/antitect-workshop-001-over-shoulder.jpg`,
    alt: "Over-the-shoulder view of someone working on a laptop while an instructor helps a participant nearby, at Antitect's first workshop in Lagos.",
    width: 810,
    height: 1080,
    position: "center",
  },
  {
    id: "full-room",
    src: `${dir}/antitect-workshop-001-full-room.jpg`,
    alt: "A packed room of attendees working on laptops at Antitect's first workshop in Lagos.",
    width: 1280,
    height: 720,
    position: "center",
  },
  {
    id: "facilitators",
    src: `${dir}/antitect-workshop-001-facilitators.jpg`,
    alt: "Facilitators walking between rows of attendees working on laptops at Antitect's first workshop in Lagos.",
    width: 980,
    height: 720,
    position: "30% center",
  },
  {
    id: "banner",
    src: `${dir}/antitect-workshop-001-banner.jpg`,
    // Every crop on the site leaves the event banner out, so the description does too.
    alt: "Attendees working across laptops and phones at Antitect's first workshop in Lagos.",
    width: 810,
    height: 680,
    position: "left bottom",
  },
];

/** The hero's photograph is one of these, not a stock image. */
export const heroPhoto = workshopPhotos[0]!;

export function photo(id: PhotoId): Photo {
  return workshopPhotos.find((item) => item.id === id)!;
}
