"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/site";

/**
 * The calendar feed, offered the two ways people actually use one: a subscribe
 * link for a phone, and a copy button for a desktop calendar that wants the
 * URL pasted in.
 *
 * It is a subscription, not a download, so a session that moves or is
 * cancelled corrects itself in their calendar without anybody being told.
 * Google can take hours over that, which is why the reminders still go out by
 * email and WhatsApp.
 *
 * The URL contains the token that authenticates it, because a calendar app
 * cannot send a cookie. So it is a password in the shape of a link: offered,
 * never printed in the page text where a screen share would catch it.
 */
export function CalendarSubscribe({ token, className }: { token: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${API_URL}/api/learner/calendar/${token}.ics`;
  const webcal = url.replace(/^https?:/, "webcal:");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      // Clipboard refused — an insecure origin, or permission denied. The
      // subscribe button still works, so say nothing and get out of the way.
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <a href={webcal}>Add to your calendar</a>
        </Button>
        <Button type="button" variant="link" onClick={copy}>
          {copied ? "Copied" : "Copy the link instead"}
        </Button>
      </div>
      <p aria-live="polite" className="mt-2 text-[0.9375rem] text-muted-foreground">
        {copied
          ? "Paste it into your calendar app as a subscription, not an import."
          : "Sessions update themselves once you have subscribed. Keep the link to yourself."}
      </p>
    </div>
  );
}
