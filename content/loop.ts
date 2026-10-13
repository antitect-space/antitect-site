/**
 * The programme loop (design C4): how every project on a capability
 * development programme runs. Programme pages only.
 *
 * The review step's line is the one place a cadence appears, and the
 * cadence belongs to the run, so a programme page passes its own from the
 * CRM's review rules (`reviewPhrase`); this line, without one, says nothing
 * about how often.
 */
export const loop = {
  steps: [
    { name: "Learn", line: "In live sessions" },
    { name: "Build", line: "A project on your own work, between sessions" },
    { name: "Review", line: "One-to-one with an instructor" },
    { name: "Improve", line: "Fix it until it works" },
    { name: "Apply", line: "Put it to use, then start the next project" },
  ],
  back: "Then back to 01 with the next project",
} as const;
