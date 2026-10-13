/**
 * Copy the team has still to supply lives in content/ as `null`, with a
 * `TODO(content)` beside it, and its element is not rendered until it is
 * filled in. This is the one check every such element goes through.
 *
 * It also refuses anything still in square brackets: the design marks every
 * gap that way ("[N] people", "[Quote to be collected]"), and a placeholder
 * pasted into content/ by mistake must never reach the page.
 */
export function filled(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim() !== "" && !/[[\]]/.test(value);
}

/** The same rule for a figure: a real, positive count, or nothing. */
export function filledCount(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
