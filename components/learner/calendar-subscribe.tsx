"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/site";

/**
 * The calendar feed, added in one tap to whichever calendar the device uses.
 *
 * There is no single link that does that everywhere. `webcal://` opens Apple
 * Calendar on an iPhone, iPad or Mac and asks to subscribe. Android has no
 * standard handler for it at all — tap one there and nothing happens — but on
 * Android the calendar *is* Google Calendar, which subscribes through its own
 * page and then syncs the feed into the app. So the button picks by device,
 * and the other calendars sit underneath it for anybody the guess gets wrong:
 * an iPhone owner who lives in Google Calendar, say, or a desktop on Outlook.
 *
 * It is a subscription, not a download, so a session that moves or is
 * cancelled corrects itself in their calendar without anybody being told.
 * Google can take hours over that, which is why the reminders still go out by
 * email and WhatsApp.
 *
 * The URL carries the token that authenticates it, because a calendar app
 * cannot send a cookie. So it is a password in the shape of a link: offered,
 * never printed in the page text where a screen share would catch it.
 */

type Platform = "apple" | "other";

/** Nothing to subscribe to: the platform never changes while the page is open. */
function subscribe(): () => void {
  return () => {};
}

function detectPlatform(): Platform {
  const agent = navigator.userAgent;
  // iPadOS reports itself as a Mac; the touch points give it away.
  const iPad = /Macintosh/.test(agent) && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod|Macintosh/.test(agent) || iPad ? "apple" : "other";
}

export function CalendarSubscribe({
  token,
  name = "Antitect sessions",
  className,
}: {
  token: string;
  /** What the calendar is called once it is added. */
  name?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  // "other" on the server and on the first paint, so the HTML matches; the
  // real answer arrives with the first render in the browser.
  const platform = useSyncExternalStore<Platform>(subscribe, detectPlatform, () => "other");

  const url = `${API_URL}/api/learner/calendar/${token}.ics`;
  const apple = url.replace(/^https?:/, "webcal:");
  const google = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(apple)}`;
  const outlook =
    "https://outlook.live.com/calendar/0/addfromweb" +
    `?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;

  const primary = platform === "apple" ? apple : google;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch {
      // Clipboard refused — an insecure origin, or permission denied. The
      // buttons still work, so say nothing and get out of the way.
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <a
            href={primary}
            // Google's page opens in a new tab so this one is still here after;
            // webcal hands straight to the Calendar app and needs no tab at all.
            {...(platform === "apple" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            Add to your calendar
          </a>
        </Button>
        {/* px-0: the size's padding otherwise wins over the link variant's,
            which indents this whenever it wraps under the button. */}
        <Button type="button" variant="link" onClick={copy} className="px-0">
          {copied ? "Copied" : "Copy the link instead"}
        </Button>
      </div>

      <p className="mt-3 text-[0.9375rem] leading-[1.5] text-muted-foreground">
        Use a different calendar?{" "}
        <a href={apple} className="font-semibold text-foreground underline underline-offset-4 hover:no-underline">
          Apple
        </a>
        {" · "}
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
        >
          Google
        </a>
        {" · "}
        <a
          href={outlook}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
        >
          Outlook
        </a>
      </p>

      <p aria-live="polite" className="mt-2 text-[0.9375rem] text-muted-foreground">
        {copied
          ? "Paste it into your calendar app as a subscription, not an import."
          : "Sessions update themselves once you have subscribed. Keep the link to yourself."}
      </p>
    </div>
  );
}
