"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Closes the mobile menu, a native <details>, once it has done its job. The
 * header stays mounted across client-side navigation, so without this the
 * menu would still be open over the next page. It also closes on a tap of an
 * in-page link such as "/#contact", where the path does not change.
 *
 * The menu itself works with no JavaScript at all; this only tidies up.
 */
export function MenuCloser({ menuId }: { menuId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const menu = document.getElementById(menuId);
    if (menu instanceof HTMLDetailsElement) menu.open = false;
  }, [menuId, pathname]);

  useEffect(() => {
    const menu = document.getElementById(menuId);
    if (!(menu instanceof HTMLDetailsElement)) return;

    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a")) menu.open = false;
    };
    menu.addEventListener("click", onClick);
    return () => menu.removeEventListener("click", onClick);
  }, [menuId]);

  return null;
}
