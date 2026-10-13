import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * A recording's poster (design W2): YouTube's thumbnail at 16:9 with square
 * corners, on wash while it loads, and the play button in the middle, a
 * 56px ink circle with a paper triangle. YouTube's thumbnail is letterboxed
 * at 4:3, so it is shown cropped to the video's own shape.
 *
 * The length chip is left out: nothing the site reads knows a video's
 * length.
 */
export function RecordingThumbnail({
  src,
  sizes,
  preload = false,
  className,
}: {
  src: string;
  sizes: string;
  /** Only for a player at the top of the page; everything else loads as it scrolls into view. */
  preload?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative block aspect-video w-full overflow-hidden bg-wash", className)}>
      <Image src={src} alt="" fill sizes={sizes} preload={preload} className="object-cover" />
      <PlayButton />
    </span>
  );
}

export function PlayButton() {
  return (
    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
      <span className="grid size-14 place-items-center rounded-full bg-ink pl-1 text-paper">
        <svg viewBox="0 0 16 18" className="h-[18px] w-4 fill-current" focusable="false">
          <path d="M0 0v18l16-9z" />
        </svg>
      </span>
    </span>
  );
}
