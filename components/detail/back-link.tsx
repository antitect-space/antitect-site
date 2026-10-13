import Link from "next/link";

import { ArrowLeft } from "@/components/icons";

/** "All webinars", above a detail page's heading (design W1): a 44px target with a small arrow. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="type-meta inline-flex h-11 items-center gap-2 self-start font-semibold text-ink underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
  );
}
