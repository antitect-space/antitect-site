"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { Channel } from "@/lib/api";
import { CONTACT } from "@/lib/site";

/** Moves focus to the new heading, so a screen reader announces what just happened. */
function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

/**
 * A place that is confirmed. Names the channel and the masked address so
 * people know where to look. A repeat sends nothing new, so it is worded in
 * the past tense rather than "check your inbox now".
 */
export function PlaceConfirmed({
  heading,
  repeat,
  channel,
  sentTo,
  title,
  next,
}: {
  heading: string;
  /** True when they already had the place. */
  repeat: boolean;
  channel: Channel;
  sentTo: string | null;
  title: string;
  next: { href: string; label: string };
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const via = channel === "whatsapp" ? "on WhatsApp" : "by email";

  let detail: string;
  if (sentTo && repeat) {
    detail = `We sent the details for ${title} ${via} to ${sentTo} when you first signed up.`;
  } else if (sentTo) {
    detail = `We have sent the details for ${title} ${via} to ${sentTo}.`;
  } else {
    detail = `Your place for ${title} is saved.`;
  }

  return (
    <div role="status">
      <h2 ref={headingRef} tabIndex={-1} className="text-title text-3xl outline-none">
        {heading}
      </h2>
      <p className="mt-4 text-lg leading-[1.6]">{detail}</p>
      <p className="mt-4 leading-[1.6] text-muted-foreground">
        {!sentTo
          ? "Questions? Write to "
          : repeat
            ? "Cannot find it? Check your spam folder, or write to "
            : "Not there in a few minutes? Check your spam folder, or write to "}
        <a href={`mailto:${CONTACT.email}`} className="font-medium text-foreground underline underline-offset-4">
          {CONTACT.email}
        </a>
        .
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href={next.href}>{next.label}</Link>
      </Button>
    </div>
  );
}

/** Replaces a form that can no longer be used, and offers the next useful step. */
export function Unavailable({
  heading,
  detail,
  next,
}: {
  heading: string;
  detail: string;
  next: { href: string; label: string };
}) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  return (
    <div role="status">
      <h2 ref={headingRef} tabIndex={-1} className="text-title text-2xl outline-none">
        {heading}
      </h2>
      <p className="mt-3 leading-[1.6] text-muted-foreground">{detail}</p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href={next.href}>{next.label}</Link>
      </Button>
    </div>
  );
}
