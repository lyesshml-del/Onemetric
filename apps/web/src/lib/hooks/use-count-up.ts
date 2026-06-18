"use client";

import { useEffect, useRef, useState } from "react";
import { countUpValue } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/**
 * Move #2 / Phase 0 — animate a number up to `target` once (on mount and on each
 * `target` change), returning the current value to render.
 *
 * - **Server / no-JS:** renders `target` immediately (the state initializes to it)
 *   — correct value, no layout shift.
 * - **`prefers-reduced-motion` (or `durationMs <= 0`):** snaps to `target`, no
 *   animation (the `useReducedMotion` branch).
 * - Otherwise: eases 0 → `target` over `durationMs` via `requestAnimationFrame`,
 *   using the pure `countUpValue` math.
 *
 * Returns a raw number; callers round/format (integers vs money/percent). Not yet
 * consumed by any component — Phase C wires it into the hero + KPIs.
 */
export function useCountUp(target: number, durationMs = 600): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
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
