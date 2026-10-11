import Image from "next/image";
import Link from "next/link";

import { PhotoSwipe } from "@/components/home/photo-swipe";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { photo, type Photo, type PhotoId } from "@/content/gallery";
import { workshop001 } from "@/content/proof";
import { filled, filledCount } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Proof: Workshop 001 (Home B, section 4, design section 08), on ink. The
 * photographs appear here in colour, never wider than 640px (they are
 * WhatsApp copies), cropped as the design crops them, which keeps the event
 * banner out.
 *
 * The headcount, the figures and the quotes are still being collected
 * (content/proof.ts). Until they are, their parts of the section are not
 * rendered, so nothing here is a placeholder.
 */

interface Placed {
  id: PhotoId;
  /** The point the crop holds, as an object-position, and how far it zooms in on it. */
  focus: string;
  zoom: number;
}

// The design's crops. The zooms take the banner at the top of the room out of frame.
const ROW_A: readonly Placed[] = [
  { id: "full-room", focus: "50% 100%", zoom: 1.39 },
  { id: "facilitators", focus: "0% 50%", zoom: 1.47 },
];

const ROW_B: readonly Placed[] = [
  { id: "over-shoulder", focus: "50% 73%", zoom: 1.17 },
  { id: "building", focus: "87% 100%", zoom: 1.75 },
  { id: "banner", focus: "50% 100%", zoom: 1.49 },
];

export function ProofSection() {
  const { anchor, title, place, date, people, builds, days, quotes, recap, leadAfterHeadcount } = workshop001;

  // The figures show as a set: one alone, "1 day", says nothing.
  const figures = filledCount(people) && filledCount(builds)
    ? [
        { value: people, label: "people" },
        { value: builds, label: "working builds" },
        { value: days, label: days === 1 ? "day" : "days" },
      ]
    : null;

  const ready = quotes.filter((item) => filled(item.quote) && filled(item.built) && filled(item.name));

  return (
    <section id={anchor} aria-labelledby="proof-title" className="surface-ink scroll-mt-0 py-16 lg:py-28">
      <div className="flex flex-col gap-10 lg:gap-16">
        <div className="container-site flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="flex max-w-[564px] flex-col gap-4 lg:gap-5">
            <h2 id="proof-title" className="type-h2 text-paper">
              {title}
            </h2>
            <div className="type-lead text-ink-faint">
              <p>
                {place}, {date}.
              </p>
              {filledCount(people) ? (
                <p>
                  {people} {leadAfterHeadcount}
                </p>
              ) : null}
            </div>
          </div>

          {figures ? (
            <dl className="grid grid-cols-3 gap-4 lg:w-[564px] lg:gap-6">
              {figures.map((figure) => (
                <div key={figure.label} className="flex flex-col-reverse gap-1 border-t border-ink-muted pt-3 lg:pt-4">
                  <dt className="type-small text-ink-faint">{figure.label}</dt>
                  <dd className="type-h2 text-paper tabular-nums">{figure.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {/* Desktop: two rows, the first two photographs sharing one height. */}
        <div className="container-site hidden flex-col gap-10 lg:flex">
          <div className="grid grid-cols-[640fr_488fr] gap-6">
            {ROW_A.map((placed, index) => (
              <Figure key={placed.id} placed={placed} aspect={index === 0 ? "aspect-[640/380]" : "aspect-[488/380]"} sizes="(min-width: 1440px) 640px, 45vw" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {ROW_B.map((placed) => (
              <Figure key={placed.id} placed={placed} aspect="aspect-[368/276]" sizes="(min-width: 1440px) 368px, 30vw" />
            ))}
          </div>
        </div>

        {/* A phone: one strip to swipe. */}
        <div className="lg:hidden">
          <PhotoSwipe count={ROW_A.length + ROW_B.length}>
            {[...ROW_A, ...ROW_B].map((placed) => (
              <Figure key={placed.id} placed={placed} aspect="aspect-[300/225]" sizes="300px" className="w-[300px] shrink-0 snap-start" />
            ))}
          </PhotoSwipe>
        </div>

        {ready.length > 0 ? (
          <div className="container-site grid gap-4 lg:grid-cols-2 lg:gap-6">
            {ready.map((item) => (
              <figure key={item.name} className="flex flex-col gap-4 rounded-md border border-ink-muted p-5 lg:py-8 lg:pr-28 lg:pl-8">
                <blockquote className="type-body text-paper">{item.quote}</blockquote>
                <p className="type-meta font-medium text-ink-faint">Built: {item.built}</p>
                <figcaption className="type-small text-ink-faint">
                  {item.name}, {item.role}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}

        {recap ? (
          <div className="container-site">
            <Button asChild size="lg" variant="text" className="text-paper">
              <Link href={recap.href}>
                {recap.label}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Figure({ placed, aspect, sizes, className }: { placed: Placed; aspect: string; sizes: string; className?: string }) {
  const picture: Photo = photo(placed.id);

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div className={cn("relative overflow-hidden bg-ink-muted", aspect)}>
        <Image
          src={picture.src}
          alt={picture.alt}
          fill
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: placed.focus, transform: `scale(${placed.zoom})`, transformOrigin: placed.focus }}
        />
      </div>
      <figcaption className="type-meta font-medium text-ink-faint">{picture.caption}</figcaption>
    </figure>
  );
}
