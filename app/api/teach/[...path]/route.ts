import { forwardArea } from "@/lib/area-proxy";

/** Mounted here rather than at /api/[area], so nothing else under /api is captured. */
export const dynamic = "force-dynamic";

export const POST = forwardArea("teach");
/** Closing a review window. The allow-list, not the export, decides what is forwarded. */
export const DELETE = forwardArea("teach");
