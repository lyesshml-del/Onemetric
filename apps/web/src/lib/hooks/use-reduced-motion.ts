"use client";

import { useEffect, useState } from "react";

/**
 * Move #2 / Phase 0 — `true` when the user prefers reduced motion.
 *
 * Pure-CSS motions are already neutralized globally by the
 * `@media (prefers-reduced-motion: reduce)` guard in `globals.css`; this hook is
 * only for the few **JS-driven** motions that must branch (e.g. `useCountUp` →
 * show the final value immediately). SSR-safe: `false` on the server and on first
 * client render (no hydration mismatch), then synced on mount and on change.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
