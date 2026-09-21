/**
 * Workshop 001, Lagos, 1 August 2026. The only photographs on the site that
 * are ours, and the only proof that matters: people came and built something.
 *
 * These are WhatsApp copies, so `width` and `height` are their real pixel
 * sizes and nothing may be displayed larger — upscaling makes them visibly
 * soft. The people in them are identifiable: consent to appear in marketing
 * must be confirmed before launch.
 */
export interface Photo {
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
    src: `${dir}/antitect-workshop-001-building.jpg`,
    alt: "A woman working on a laptop in the foreground, with a full room of attendees and a presentation on screen behind her, at Antitect's first workshop in Lagos.",
    width: 1080,
    height: 810,
    position: "center",
  },
  {
    src: `${dir}/antitect-workshop-001-over-shoulder.jpg`,
    alt: "Over-the-shoulder view of someone working on a laptop while an instructor helps a participant nearby, at Antitect's first workshop in Lagos.",
    width: 810,
    height: 1080,
    position: "center",
  },
  {
    src: `${dir}/antitect-workshop-001-full-room.jpg`,
    alt: "A packed room of attendees working on laptops at Antitect's first workshop in Lagos.",
    width: 1280,
    height: 720,
    position: "center",
  },
  {
    src: `${dir}/antitect-workshop-001-facilitators.jpg`,
    alt: "Facilitators walking between rows of attendees working on laptops at Antitect's first workshop in Lagos.",
    width: 980,
    height: 720,
    position: "30% center",
  },
  {
    src: `${dir}/antitect-workshop-001-banner.jpg`,
    alt: 'Attendees at Antitect\'s first workshop in Lagos, beneath the event banner reading "Build with AI, Automate Workflows, Monetize Skill."',
    width: 810,
    height: 680,
    position: "center",
  },
];

/** The hero's photograph is one of these, not a stock image. */
export const heroPhoto = workshopPhotos[0]!;
