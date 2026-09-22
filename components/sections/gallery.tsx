import Image from "next/image";
import Link from "next/link";

import { Cut } from "@/components/cut";
import { GalleryViewer } from "@/components/gallery-viewer";
import { Reveal } from "@/components/motion/reveal";
import { StripCounter } from "@/components/strip-counter";
import { Button } from "@/components/ui/button";
import { workshopPhotos, type Photo } from "@/content/gallery";

/**
 * The proof. Antitect has run a workshop, people filled the room, and these
 * are the photographs — the most persuasive thing on the page, and the answer
 * to the question the section above asks.
 *
 * One set of tiles: a swipe strip on a phone, an uneven grid on a desktop,
 * sized to each photograph rather than forced into squares.
 */
export function GallerySection() {
  return (
    <section aria-labelledby="gallery-title" className="border-b">
      <div className="container-page py-16 lg:py-24">
        <h2 id="gallery-title" className="text-display text-4xl sm:text-5xl">
          Inside Workshop 001.
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">Lagos, 1 August 2026.</p>

        <div className="mt-10 lg:mt-12">
          <GalleryViewer photos={workshopPhotos}>
            <StripCounter count={workshopPhotos.length}>
              {workshopPhotos.map((photo, index) => (
                <Tile key={photo.src} photo={photo} index={index} />
              ))}
            </StripCounter>
          </GalleryViewer>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <p className="text-lg font-semibold">Be in the room next time.</p>
          <Button asChild variant="secondary" size="lg">
            <Link href="/events">See upcoming events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Which corner is cut varies down the set; the angle never does. */
const TILES = [
  { cut: "br", span: "md:col-span-2 md:row-start-1 md:h-[26rem]" },
  { cut: "tr", span: "md:col-start-3 md:row-start-1 md:h-[26rem]" },
  { cut: "bl", span: "md:row-start-2 md:h-[13rem]" },
  { cut: "tr", span: "md:row-start-2 md:h-[13rem]" },
  { cut: "br", span: "md:row-start-2 md:h-[13rem]" },
] as const;

function Tile({ photo, index }: { photo: Photo; index: number }) {
  const { cut, span } = TILES[index] ?? TILES[0];

  return (
    <Reveal kind="wipe" delay={index * 70} className={`w-[85%] shrink-0 snap-center md:w-auto ${span}`}>
      <Cut corner={cut} className="h-full">
        <button
          type="button"
          data-photo={index}
          aria-label={`Open photograph ${index + 1} of ${workshopPhotos.length} larger`}
          className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span className="relative block aspect-[4/3] h-full w-full md:aspect-auto">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 33vw, 85vw"
            style={{ objectPosition: photo.position }}
            className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
          </span>
        </button>
      </Cut>
    </Reveal>
  );
}
