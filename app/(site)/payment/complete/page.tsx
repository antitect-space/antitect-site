import type { Metadata } from "next";

import { PaymentStatus } from "@/components/payment-status";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

/**
 * Where Paystack sends people back to, with `?trxref=…&reference=…`. Reading
 * the query makes this render per request, which it must: nothing about a
 * payment can be cached. The status comes from the API, polled in the browser.
 */
export default async function PaymentCompletePage({ searchParams }: PageProps<"/payment/complete">) {
  const query = await searchParams;
  const raw = query.reference ?? query.trxref;
  const reference = typeof raw === "string" && raw.trim() ? raw.trim() : null;

  // A column of at most 560px, left-aligned, with the header and footer and nothing else (design C10).
  return (
    <div className="container-site pt-12 pb-24 lg:pt-28 lg:pb-44">
      <PaymentStatus reference={reference} />
    </div>
  );
}
