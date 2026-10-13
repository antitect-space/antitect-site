import Image from "next/image";
import Link from "next/link";

import { PhotoSwipe } from "@/components/home/photo-swipe";
import { ArrowRight } from "@/components/icons";
import { crops, photo, type PhotoId } from "@/content/gallery";
import type { Recap } from "@/content/recaps";
import { filled, filledCount } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * A workshop that has happened (design C9): its card on the workshops page,
 * the strip on a workshop's page, and the recap page's figures, gallery and
 * quotes. The photographs keep Home B's crops, which leave the event banner
 * out, and are never shown wider than 640px: they are WhatsApp copies.
 */

/** "Lagos · 1 August 2026", and "· 40 people" once the headcount is confirmed. */
export function recapMeta(recap: Recap, tail = "people"): string {
  const parts = [recap.place, recap.date];
  if (filledCount(recap.people)) parts.push(`${recap.people} ${tail}`);
  return parts.join(" · ");
}

function CroppedPhoto({
  id,
  sizes,
  decorative = false,
  className,
}: {
  id: PhotoId;
  sizes: string;
  /** Inside a link that already names the workshop. */
  decorative?: boolean;
  className?: string;
}) {
  const picture = photo(id);
  const { focus, zoom } = crops[id];
  return (
    <div className={cn("relative overflow-hidden bg-wash", className)}>
      <Image
        src={picture.src}
        alt={decorative ? "" : picture.alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: focus, transform: `scale(${zoom})`, transformOrigin: focus }}
      />
    </div>
  );
}

/** "Past workshops": one link to the recap, three photographs, the name and where and when. */
export function RecapCard({ recap }: { recap: Recap }) {
  const [large, ...small] = recap.card;
  return (
    <Link href={`/workshops/${recap.slug}`} className="group flex flex-col gap-4 lg:gap-5">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[564fr_270fr_270fr] lg:gap-6">
        <CroppedPhoto
          id={large}
          decorative
          sizes="(min-width: 1024px) 564px, 100vw"
          className="col-span-2 aspect-[350/210] lg:col-span-1 lg:aspect-[564/330]"
        />
        {small.map((id) => (
          <CroppedPhoto
            key={id}
            id={id}
            decorative
            sizes="(min-width: 1024px) 270px, 50vw"
            className="aspect-[171/110] lg:aspect-[270/330]"
          />
        ))}
      </div>
      <span className="flex flex-col gap-1.5">
        <span className="type-h3 text-ink underline-offset-4 group-hover:underline">{recap.name}</span>
        <span className="type-meta font-medium text-ink-muted tabular-nums">{recapMeta(recap)}</span>
        <span className="flex h-11 items-center gap-2 text-base font-semibold text-ink">
          See inside
          <ArrowRight />
        </span>
      </span>
    </Link>
  );
}

/** "See a past workshop" on a workshop's page: three photographs, where and when, and the way in. */
export function PastWorkshopStrip({ recap }: { recap: Recap }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {recap.strip.map((id) => (
          <CroppedPhoto key={id} id={id} decorative sizes="(min-width: 1024px) 215px, 33vw" className="aspect-[215/150]" />
        ))}
      </div>
      <p className="type-small text-ink-muted tabular-nums">
        {recapMeta(recap, filledCount(recap.people) ? "people, one day" : "people")}
      </p>
      <Link
        href={`/workshops/${recap.slug}`}
        aria-label={`See inside ${recap.name}`}
        className="type-small flex h-11 items-center gap-1.5 self-start font-semibold text-ink underline-offset-4 hover:underline"
      >
        See inside
        <ArrowRight />
      </Link>
    </div>
  );
}

/** The figures, as a set: one alone, "1 day", says nothing. */
export function RecapFigures({ recap }: { recap: Recap }) {
  if (!filledCount(recap.people) || !filledCount(recap.builds)) return null;
  const figures = [
    { value: recap.people, label: "people" },
    { value: recap.builds, label: "working builds" },
    { value: recap.days, label: recap.days === 1 ? "day" : "days" },
  ];
  return (
    <dl className="grid grid-cols-3 gap-2 lg:gap-6">
      {figures.map((figure) => (
        <div key={figure.label} className="flex flex-col-reverse gap-1 border-t border-rule pt-3 lg:pt-4">
          <dt className="type-small text-ink-muted">{figure.label}</dt>
          <dd className="type-h2 text-ink tabular-nums">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Every photograph with its caption: three rows on a desktop, the swipeable strip on a phone. */
export function RecapGallery({ recap }: { recap: Recap }) {
  const all = recap.gallery.flat();
  const row = (ids: readonly PhotoId[], index: number) => {
    if (index === 0) {
      return (
        <Captioned key={ids.join()} id={ids[0]!} sizes="640px" className="aspect-[640/384]" width="w-[640px] max-w-full" />
      );
    }
    return (
      <div
        key={ids.join()}
        className={cn("grid gap-6", index === 1 ? "grid-cols-2" : "grid-cols-[419fr_219fr]")}
      >
        {ids.map((id, position) => (
          <Captioned
            key={id}
            id={id}
            sizes={index === 1 ? "320px" : position === 0 ? "420px" : "220px"}
            className={index === 1 ? "aspect-[319/240]" : position === 0 ? "aspect-[419/280]" : "aspect-[219/280]"}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="hidden flex-col gap-8 lg:flex">{recap.gallery.map(row)}</div>
      {/* A phone: one strip to swipe, edge to edge. */}
      <div className="-mx-[var(--page-margin)] lg:hidden">
        <PhotoSwipe count={all.length} tone="paper">
          {all.map((id) => (
            <Captioned key={id} id={id} sizes="300px" className="aspect-[300/225]" width="w-[300px] shrink-0 snap-start" />
          ))}
        </PhotoSwipe>
      </div>
    </>
  );
}

function Captioned({ id, sizes, className, width }: { id: PhotoId; sizes: string; className: string; width?: string }) {
  return (
    <figure className={cn("flex flex-col gap-2", width)}>
      <CroppedPhoto id={id} sizes={sizes} className={className} />
      <figcaption className="type-meta font-medium text-ink-muted">{photo(id).caption}</figcaption>
    </figure>
  );
}

/** "What people built": the attendees' own words, once they are collected. */
export function RecapQuotes({ recap, title }: { recap: Recap; title: string }) {
  const ready = recap.quotes.filter((item) => filled(item.quote) && filled(item.built) && filled(item.name));
  if (ready.length === 0) return null;
  return (
    <section aria-labelledby="built-title" className="flex flex-col gap-6">
      <h2 id="built-title" className="type-h2 text-ink">
        {title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {ready.map((item) => (
          <figure key={item.name} className="flex flex-col gap-4 rounded-md border border-field-border p-6">
            <blockquote className="type-body text-ink">{item.quote}</blockquote>
            <p className="type-meta font-medium text-ink-muted">Built: {item.built}</p>
            <figcaption className="type-small text-ink-muted">
              {item.name}
              {filled(item.role) ? `, ${item.role}` : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
