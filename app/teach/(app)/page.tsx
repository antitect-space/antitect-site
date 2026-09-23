import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NoSession } from "@/lib/area-api";
import { getTutor } from "@/lib/tutor-api";

export const metadata: Metadata = { title: "Your runs" };

/**
 * The tutor's dashboard, as far as it goes today.
 *
 * Its job is one question — what needs me now — and the answer is the review
 * queue, which the API does not serve yet. Until it does, this says who is
 * signed in and nothing more: a queue invented here would be a lie about
 * somebody's work.
 */
export default async function TutorHomePage() {
  let tutor;
  try {
    tutor = await getTutor();
  } catch (error) {
    if (error instanceof NoSession) redirect("/teach/login");
    throw error;
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-display text-[2.5rem] sm:text-5xl">Welcome, {tutor.firstName}.</h1>
      <p className="mt-8 max-w-[52ch] text-lg leading-[1.6]">
        Your runs, your review queue and your schedule appear here as they are set up.
      </p>
    </div>
  );
}
