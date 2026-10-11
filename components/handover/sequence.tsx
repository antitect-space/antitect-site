"use client";

import { useEffect } from "react";

type Status = "idle" | "playing" | "done";

interface Sequence {
  frame: HTMLElement;
  times: number[];
  timers: number[];
  status: Status;
}

/**
 * Plays the handover cards: the page's one piece of motion script.
 *
 * Each card (`[data-sequence]`) lists when its steps begin. Playing it means
 * setting `data-step` to each step in turn; CSS transitions do the rest. The
 * hero's card plays on load; every other card plays once 40% of it is on
 * screen. A card plays once and holds its end, and plays again only after it
 * has left the screen entirely and come back. Nothing loops.
 *
 * With reduced motion it does nothing, and every card shows its end, as it
 * does without JavaScript.
 */
export function HandoverSequences() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = [...document.querySelectorAll<HTMLElement>("[data-sequence]")];
    const sequences = new Map<HTMLElement, Sequence>(
      frames.map((frame) => [
        frame,
        { frame, times: (frame.dataset.times ?? "0").split(",").map(Number), timers: [], status: "idle" },
      ]),
    );

    const stop = (sequence: Sequence) => {
      sequence.timers.forEach((timer) => window.clearTimeout(timer));
      sequence.timers = [];
    };

    /** At once, with no transition: used off screen, or before the first paint. */
    const jump = (sequence: Sequence, step: number | null) => {
      const { frame } = sequence;
      frame.setAttribute("data-instant", "");
      if (step === null) frame.removeAttribute("data-step");
      else frame.dataset.step = String(step);
      void frame.offsetWidth;
      frame.removeAttribute("data-instant");
    };

    const play = (sequence: Sequence) => {
      stop(sequence);
      sequence.status = "playing";
      sequence.frame.dataset.playing = "";
      sequence.times.forEach((at, step) => {
        sequence.timers.push(
          window.setTimeout(() => {
            sequence.frame.dataset.step = String(step);
            if (step === sequence.times.length - 1) sequence.status = "done";
          }, at),
        );
      });
    };

    const reset = (sequence: Sequence) => {
      stop(sequence);
      jump(sequence, 0);
      sequence.status = "idle";
    };

    const showEnds = () => {
      for (const sequence of sequences.values()) {
        stop(sequence);
        jump(sequence, null);
        sequence.status = "done";
        sequence.frame.dataset.playing = "";
      }
    };

    if (motion.matches) {
      showEnds();
      return;
    }

    for (const sequence of sequences.values()) {
      if (sequence.frame.dataset.trigger === "load") {
        if (sequence.frame.dataset.step !== "0") jump(sequence, 0);
        play(sequence);
      } else {
        reset(sequence);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sequence = sequences.get(entry.target as HTMLElement);
          if (!sequence) continue;
          if (entry.intersectionRatio >= 0.4 && sequence.status === "idle") play(sequence);
          else if (!entry.isIntersecting && sequence.status !== "idle") reset(sequence);
        }
      },
      { threshold: [0, 0.4] },
    );
    frames.forEach((frame) => observer.observe(frame));

    // Somebody who turns reduced motion on mid-visit gets every end at once.
    const onChange = () => {
      if (!motion.matches) return;
      observer.disconnect();
      showEnds();
    };
    motion.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onChange);
      sequences.forEach(stop);
    };
  }, []);

  return null;
}
