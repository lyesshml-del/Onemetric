"use client";

import { useCallback, useEffect, useState } from "react";

const EVENT = "om:onboarding-dismissed";
const keyFor = (projectId: string) => `om:onboarding-dismissed:${projectId}`;

/**
 * ONE-74 (Move #5 — Activation Loop) — lets an established user permanently
 * dismiss the per-project onboarding chrome (the ONE-71 `FirstValueBanner` + the
 * ONE-66 `OnboardingChecklist`). The dismissal is a UI preference, so it lives in
 * `localStorage` keyed by project — **no schema, no server round-trip**.
 *
 * Returns `[dismissed, dismiss]`. `dismiss()` persists the flag and dispatches a
 * window event so every consumer on the page hides at once (the banner and the
 * checklist aren't adjacent in the DOM); the `storage` event keeps other tabs in
 * sync. SSR/first paint returns `false` (no flash-hide mismatch) and reconciles
 * after mount.
 */
export function useOnboardingDismissed(
  projectId: string,
): [boolean, () => void] {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = keyFor(projectId);
    const read = () => {
      try {
        setDismissed(localStorage.getItem(key) === "1");
      } catch {
        // localStorage unavailable (private mode / SSR) — stay visible.
      }
    };
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, [projectId]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(keyFor(projectId), "1");
    } catch {
      // ignore — fall back to hiding this view in-memory for the session
    }
    setDismissed(true);
    window.dispatchEvent(new Event(EVENT));
  }, [projectId]);

  return [dismissed, dismiss];
}
