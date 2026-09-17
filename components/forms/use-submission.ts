"use client";

import { useState } from "react";

const SLOW_AFTER_MS = 8_000;

/**
 * Runs a submit and says when it is taking long. The API can take many seconds
 * to wake, and a button that just sits there reads as broken.
 */
export function useSubmission() {
  const [slow, setSlow] = useState(false);

  async function run<T>(task: () => Promise<T>): Promise<T> {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    try {
      return await task();
    } finally {
      clearTimeout(timer);
      setSlow(false);
    }
  }

  return { slow, run };
}
