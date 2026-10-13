/**
 * Two of Home B's rings behind a listing page's header (design W9, "Ring
 * echo"): radii 388 and 308, one centre on the content column's right edge,
 * 1px in the rule colour, clipped at the header's edges. Desktop only, no
 * chips or logos, and decoration only.
 *
 * Put it first inside a `relative overflow-hidden` header.
 */
export function RingEcho() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-lg:hidden">
      <div className="container-site relative h-full">
        <div className="absolute top-1/2 right-[var(--page-margin)] size-0">
          <span className="absolute -top-[388px] -left-[388px] size-[776px] rounded-full border border-rule" />
          <span className="absolute -top-[308px] -left-[308px] size-[616px] rounded-full border border-rule" />
        </div>
      </div>
    </div>
  );
}
