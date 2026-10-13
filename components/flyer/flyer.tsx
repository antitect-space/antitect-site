"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Close, Expand } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * A webinar's, workshop's or programme's one uploaded image (design C12),
 * shown whole at its own shape and never cropped: its box is sized from the
 * image's own width and height, so the space is kept before it loads and
 * nothing shifts. A 1px rule-colour line frames it; square corners, no
 * shadow. While it loads, a wash block at its shape, with no spinner.
 *
 * The whole flyer is one button, "View full size", with the expand mark in
 * its corner; it opens the full-size viewer, a native dialog on ink, which
 * closes on its button, on Escape and on a tap outside the flyer, keeps
 * focus inside while open and hands it back to the flyer.
 *
 * Optional everywhere: the page text carries every fact on it, so the alt
 * text is only "Flyer for [title]".
 */

export interface FlyerImage {
  src: string;
  /** From the image itself (getImageSize); null when it could not be read. */
  width: number | null;
  height: number | null;
}

/**
 * - `detail`, in a detail page's content column: a landscape flyer fills it;
 *   a square or portrait one is 400px wide, a tall one 320; never taller than
 *   640. On a phone, full width up to 560 tall.
 * - `card`, in a card's four columns: a box the width of the column, the
 *   flyer filling it up to 400px tall (360 on a phone) and sitting whole on
 *   wash when it is taller.
 */
type Placement = "detail" | "card";

/** Unknown sizes are shown whole in a 4:5 box. */
const FALLBACK = { width: 4, height: 5 };

export function Flyer({
  image,
  title,
  placement,
  className,
}: {
  image: FlyerImage;
  title: string;
  placement: Placement;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const known = image.width && image.height ? { width: image.width, height: image.height } : null;
  const { width, height } = known ?? FALLBACK;
  const ratio = width / height;
  const alt = `Flyer for ${title}`;

  const frame = (
    <span
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "relative block overflow-hidden bg-wash ring-1 ring-rule",
        placement === "detail" && "w-full",
        placement === "card" && "h-full max-w-full",
      )}
    >
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={placement === "detail" ? detailSizes(ratio) : "(min-width: 1024px) 368px, calc(100vw - 88px)"}
        onLoad={() => setLoaded(true)}
        className={cn("object-contain transition-opacity motion-reduce:transition-none", loaded ? "opacity-100" : "opacity-0")}
      />
      {/* The expand mark, once there is something to expand. */}
      {loaded ? (
        <span aria-hidden="true" className="absolute top-2 right-2 grid size-11 place-items-center rounded-md bg-ink text-paper">
          <Expand />
        </span>
      ) : null}
    </span>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View full size: ${alt}`}
        aria-haspopup="dialog"
        // A button is only as wide as its content, so the width rule sits here, where 100% means the column.
        style={{ ["--r" as string]: ratio }}
        className={cn(
          "block cursor-zoom-in text-left",
          placement === "card" ? "w-full" : detailWidth(ratio),
          className,
        )}
      >
        {placement === "card" ? (
          // The column's box: as tall as the flyer up to the limit, on wash beyond it.
          <span
            style={{ aspectRatio: `${width} / ${height}` }}
            className="flex max-h-[360px] w-full justify-center bg-wash lg:max-h-[400px]"
          >
            {frame}
          </span>
        ) : (
          frame
        )}
      </button>
      {open ? (
        <FlyerViewer
          image={image}
          // Unknown sizes are given a large 4:5 frame; the image keeps its own shape inside it.
          size={known ?? { width: FALLBACK.width * 400, height: FALLBACK.height * 400 }}
          alt={alt}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function detailWidth(ratio: number): string {
  // Landscape fills the column; square and portrait 400px; tall 320px; never taller than 640.
  if (ratio > 1.05) return "w-[min(100%,calc(560px*var(--r)))] lg:w-[min(100%,calc(640px*var(--r)))]";
  if (ratio >= 0.6) return "w-[min(100%,calc(560px*var(--r)))] lg:w-[min(100%,400px,calc(640px*var(--r)))]";
  return "w-[min(100%,calc(560px*var(--r)))] lg:w-[min(100%,320px,calc(640px*var(--r)))]";
}

function detailSizes(ratio: number): string {
  if (ratio > 1.05) return "(min-width: 1024px) 662px, calc(100vw - 40px)";
  if (ratio >= 0.6) return "(min-width: 1024px) 400px, calc(100vw - 40px)";
  return "(min-width: 1024px) 320px, calc(100vw - 40px)";
}

/** The flyer as large as the screen allows, on ink. Mounted only while open, so the full-size image loads only then. */
function FlyerViewer({
  image,
  size,
  alt,
  onClose,
}: {
  image: FlyerImage;
  size: { width: number; height: number };
  alt: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // The flyer had focus; the dialog hands it back when it closes.
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      root.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={alt}
      onClose={onClose}
      onClick={(event) => {
        // Anywhere but the flyer itself closes it.
        if (event.target !== imageRef.current) dialogRef.current?.close();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none bg-ink p-0 text-paper backdrop:bg-ink"
    >
      <div
        style={{ ["--r" as string]: size.width / size.height }}
        className="flex h-full w-full items-center justify-center p-2 pt-16 lg:px-20 lg:py-[90px]"
      >
        {/* As wide as the screen allows at the flyer's shape, so its box (wash until it loads) is the flyer itself. */}
        <Image
          ref={imageRef}
          src={image.src}
          alt={alt}
          width={size.width}
          height={size.height}
          sizes="100vw"
          loading="eager"
          className="h-auto w-[min(100%,calc((100dvh-72px)*var(--r)))] bg-wash object-contain lg:w-[min(100%,calc((100dvh-180px)*var(--r)))]"
        />
      </div>
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        aria-label="Close"
        className="absolute top-3 right-3 grid size-11 place-items-center rounded-md bg-paper text-ink lg:top-6 lg:right-6"
      >
        <Close />
      </button>
    </dialog>
  );
}
