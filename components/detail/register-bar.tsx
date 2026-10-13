"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The mobile register bar (design W8, and C8's programme and workshop bars):
 * 64px, fixed to the bottom of a phone's screen, the date (and the price,
 * where there is one) on the left and the red button on the right, which
 * scrolls back to the panel and puts the cursor in First name.
 *
 * It shows only once the panel has scrolled up out of view, and hides while
 * the panel or the footer is on screen, so it never shares the screen with
 * another red button. It is offered only while the panel holds a form to
 * register, reserve or enrol with (marked `data-register-form`): never after
 * a registration, and never for a full, closed, live or ended session.
 *
 * Slides in over 150ms, and simply appears with reduced motion.
 */
export function RegisterBar({
  label,
  lines,
  target = "register",
}: {
  /** "Register free", "Reserve your place", "Secure your place". */
  label: string;
  /** One line, or two where a price comes too: ["Starts 26 Oct", "₦100,000"]. */
  lines: string[];
  /** The panel's id. */
  target?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const panel = document.getElementById(target);
    const footer = document.querySelector("footer");
    if (!panel) return;

    let offered = false;
    let panelOnScreen = true;
    let panelAbove = false;
    let footerOnScreen = false;
    const update = () => setShown(offered && !panelOnScreen && panelAbove && !footerOnScreen);

    const watch = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === panel) {
          panelOnScreen = entry.isIntersecting;
          panelAbove = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        } else {
          footerOnScreen = entry.isIntersecting;
        }
      }
      update();
    });
    watch.observe(panel);
    if (footer) watch.observe(footer);

    // The panel changes state without the page knowing: after a registration, or at the start time.
    const check = () => {
      offered = panel.querySelector("form[data-register-form]:not([hidden])") !== null;
      update();
    };
    const changes = new MutationObserver(check);
    changes.observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    check();

    return () => {
      watch.disconnect();
      changes.disconnect();
    };
  }, [target]);

  function goToForm() {
    const panel = document.getElementById(target);
    if (!panel) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });

    // First name on the form in view; on a checkout's second step, its heading.
    const form = panel.querySelector<HTMLFormElement>("form[data-register-form]:not([hidden])");
    const field = form?.querySelector<HTMLInputElement>("input:not([type=hidden])");
    const heading = form?.querySelector<HTMLElement>("h2, h3");
    (field ?? heading)?.focus({ preventScroll: true });
  }

  return (
    <div
      inert={!shown}
      aria-hidden={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-between gap-3 border-t border-rule bg-paper px-5 transition-[translate,visibility] duration-150 ease-out motion-reduce:transition-none lg:hidden",
        shown ? "visible translate-y-0" : "invisible translate-y-full",
      )}
    >
      <p className="type-meta min-w-0 font-semibold text-ink tabular-nums">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
      <Button size="default" className="shrink-0 px-4" onClick={goToForm}>
        {label}
      </Button>
    </div>
  );
}
