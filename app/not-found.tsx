import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-20 lg:py-28">
      <h1 className="text-display text-4xl sm:text-5xl">This page does not exist.</h1>
      <Button asChild variant="secondary" size="lg" className="mt-8">
        <Link href="/">Go to the home page</Link>
      </Button>
    </div>
  );
}
