"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import type { Photo } from "@/content/gallery";

/**
 * Opens a photograph larger. A native <dialog> gives the focus trap, the
 * Escape key and the backdrop for free; arrows and swipe are added here.
 *
 * The tiles themselves are rendered on the server and passed straight through
 * — this only listens for a click on one, so the gallery costs no extra
 * markup and works as a grid of links to nothing when JavaScript is absent.
 */
export function GalleryViewer({ photos, children }: { photos: Photo[]; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const show = useCallback((next: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(next);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const step = useCallback(
    (by: number) => {
      setIndex((current) => (current === null ? null : (current + by + photos.length) % photos.length));
    },
    [photos.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    }

    function onClose() {
      openerRef.current?.focus();
      openerRef.current = null;
    }

    dialog.addEventListener("keydown", onKeyDown);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  const photo = index === null ? null : photos[index];

  return (
    <>
      <div
        onClick={(event) => {
          const tile = (event.target as HTMLElement).closest<HTMLElement>("[data-photo]");
          if (!tile) return;
          const next = Number(tile.dataset.photo);
          if (Number.isInteger(next)) show(next, tile);
        }}
      >
        {children}
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Workshop photographs"
        className="max-h-[100dvh] max-w-[100vw] bg-transparent backdrop:bg-foreground/90"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const from = touchStart.current;
          const to = event.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (from === null || to === undefined) return;
          if (Math.abs(to - from) > 48) step(to < from ? 1 : -1);
        }}
      >
        {photo ? (
          <figure className="flex h-[100dvh] w-screen flex-col items-center justify-center gap-4 p-4">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="100vw"
              className="max-h-[78dvh] w-auto max-w-full object-contain"
              style={{ maxWidth: `${photo.width}px` }}
            />
            <figcaption className="flex w-full max-w-3xl items-center justify-between gap-4 text-background">
              <span className="text-[0.9375rem] tabular-nums">
                {(index ?? 0) + 1} / {photos.length}
              </span>
              <span className="flex gap-2">
                <ViewerButton label="Previous photograph" onClick={() => step(-1)}>
                  ‹
                </ViewerButton>
                <ViewerButton label="Next photograph" onClick={() => step(1)}>
                  ›
                </ViewerButton>
                <ViewerButton label="Close" onClick={close}>
                  ✕
                </ViewerButton>
              </span>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}

function ViewerButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center border-2 border-background/60 text-xl leading-none text-background hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-background focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
