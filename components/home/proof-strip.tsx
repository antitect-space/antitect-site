import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/icons";
import { photo, type PhotoId } from "@/content/gallery";
import { workshop001 } from "@/content/proof";
import { filledCount } from "@/lib/content";

/**
 * Proof in place of a logo wall (design B3): five Workshop 001 photographs,
 * cropped close on people working and never on the event banner, with a line
 * that leads to the proof section. Square corners. The headcount appears only
 * once it is confirmed (content/proof.ts).
 *
 * The crops follow the design's: each holds a point of the photograph and
 * zooms in on it. The photographs are below the fold on every screen, so
 * they load lazily, and they are decorative here: the caption says what they
 * are, and the proof section shows them properly.
 */

interface Crop {
  id: PhotoId;
  /** The point the crop holds, as an object-position. */
  focus: string;
  zoom: number;
}

const CROPS: readonly Crop[] = [
  { id: "full-room", focus: "45% 100%", zoom: 1.7 },
  { id: "building", focus: "100% 100%", zoom: 1.8 },
  { id: "over-shoulder", focus: "50% 72%", zoom: 1.6 },
  { id: "facilitators", focus: "32% 77%", zoom: 2 },
  { id: "banner", focus: "0% 100%", zoom: 1.65 },
];

/** The three a phone has room for. */
const SMALL: readonly PhotoId[] = ["building", "over-shoulder", "full-room"];

export function ProofStrip() {
  const { name, place, people, anchor } = workshop001;
  const headcount = filledCount(people) ? `${people} people, one day` : null;
  const lead = [`${name}, ${place}`, headcount].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3">
      {/* Two rows rather than one reordered: a lazy image in the hidden one is never fetched. */}
      <div className="flex w-full gap-2 lg:hidden">
        {SMALL.map((id) => (
          <Thumb key={id} crop={CROPS.find((crop) => crop.id === id)!} />
        ))}
      </div>
      <div className="hidden gap-4 lg:flex">
        {CROPS.map((crop) => (
          <Thumb key={crop.id} crop={crop} />
        ))}
      </div>

      <p className="type-small flex flex-col items-center leading-[1.4] text-ink-muted lg:flex-row lg:gap-1.5">
        <span>
          {lead}
          <span aria-hidden="true" className="max-lg:hidden">
            {" "}
            ·
          </span>
        </span>
        <Link
          href={`#${anchor}`}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
        >
          See inside
          <ArrowRight />
        </Link>
      </p>
    </div>
  );
}

function Thumb({ crop }: { crop: Crop }) {
  const picture = photo(crop.id);

  return (
    <div className="relative h-[74px] flex-1 overflow-hidden bg-wash lg:h-[120px] lg:w-[180px] lg:flex-none">
      <Image
        src={picture.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 360px, 220px"
        className="object-cover"
        style={{ objectPosition: crop.focus, transform: `scale(${crop.zoom})`, transformOrigin: crop.focus }}
      />
    </div>
  );
}
