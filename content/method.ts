/**
 * The loop every Antitect programme runs on. The order is the point, and it
 * returns to the start: Apply feeds the next Learn.
 *
 * Eight words a step, hard limit. The weekly one-to-one review is deliberately
 * not named here — it leads "Why this works" instead, and saying it twice on
 * one page spends it twice.
 */
export const method: ReadonlyArray<{ name: string; detail: string }> = [
  { name: "Learn", detail: "The idea, taught live. Questions welcome." },
  { name: "Build", detail: "You build it. Most of your time." },
  { name: "Review", detail: "An instructor tells you what is wrong." },
  { name: "Improve", detail: "You fix it until it actually works." },
  { name: "Apply", detail: "You use it in your own work." },
];
