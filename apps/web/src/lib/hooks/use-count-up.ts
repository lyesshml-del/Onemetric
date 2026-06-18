"use client";

import { useEffect, useRef, useState } from "react";
import { countUpValue } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Move #2 / Phase 0 (Phase G hardening) — animate a number up to `target` on each
 * `target` **change**, returning the current value to render.
 *
 * - **Initial mount (incl. SSR hydration):** renders `target` immediately with **no
 *   animation**. This eliminates the hard-load flash — the server paints the final
 *   value, and a mount animation would reset it to 0 and re-count (a visible
 *   "final → 0 → count"). So the count-up fires on **data change** (e.g. a range
 *   switch), not on first arrival; the chart draw-in still handles the arrival cue.
 * - **`prefers-reduced-motion` / `durationMs <= 0`:** snaps to `target`, no animation.
 * - Otherwise: eases 0 → `target` over `durationMs` (rAF + the pure `countUpValue`).
 *
 * Returns a raw number; callers round/format. (`durationMs` default 600 ≈ the
 * `--motion-entrance` token.)
 */
export function useCountUp(target: number, durationMs = 600): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const initialMountRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // First effect run = initial mount / hydration: show the final value with no
    // animation → no hard-load flash. Subsequent runs are real `target` changes.
    if (initialMountRef.current) {
      initialMountRef.current = false;
      setValue(target);
      return;
    }
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(countUpValue(0, target, progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, reduced]);

  return value;
}
