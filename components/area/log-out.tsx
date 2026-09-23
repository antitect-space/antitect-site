"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { areaPost } from "@/lib/area-client";
import { AREA_HOME, type AreaName } from "@/lib/area-view";

/**
 * Ends the session at the API and clears this site's cookie, then refreshes so
 * nothing of the signed-in pages is left in the router's cache.
 *
 * It leaves either way. A logout that fails silently and keeps somebody signed
 * in on a shared phone is worse than one that tidies up late.
 */
export function LogOut({ area }: { area: AreaName }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logOut() {
    setLeaving(true);
    try {
      await areaPost(area, "auth/logout");
    } catch {
      // Nothing to tell them: they are leaving regardless.
    } finally {
      router.replace(`${AREA_HOME[area]}/login`);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logOut}
      disabled={leaving}
      className="text-[0.9375rem] font-semibold underline underline-offset-4 hover:no-underline disabled:opacity-60"
    >
      {leaving ? "Signing out…" : "Sign out"}
    </button>
  );
}
