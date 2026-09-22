import type { Metadata } from "next";

import { CutFrame } from "@/components/cut";
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

  return (
    <div className="container-page py-12 sm:py-16 lg:py-24">
      {/* Restyled only. What it reports, and when, is decided by PaymentStatus. */}
      <CutFrame corner="tr" className="max-w-3xl" innerClassName="p-6 sm:p-10">
        <PaymentStatus reference={reference} />
      </CutFrame>
    </div>
  );
}
