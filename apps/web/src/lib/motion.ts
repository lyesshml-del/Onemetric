/**
 * Move #2 / Phase 0 — pure motion math (no React, no DOM), unit-tested.
 *
 * The animation *wiring* (requestAnimationFrame) lives in `lib/hooks/use-count-up`;
 * the *math* lives here so it can be tested exhaustively in the node-only Vitest
 * suite (DECISIONS.md ADR-017). Dependency-free. Monochrome / motion only.
 */

/**
 * Ease-out cubic on a 0..1 progress (clamped to that range). Decelerates toward
 * the end — the "settling" feel for entrances (count-up, draw-in). Matches the
 * spirit of the CSS `--motion-ease` token without coupling JS to a bezier solver.
 */
export function easeOutCubic(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return 1 - Math.pow(1 - c, 3);
}

/**
 * Eased interpolation from `from` to `to` at 0..1 `progress` (progress clamped).
 * `countUpValue(0, 100, 0) === 0`, `countUpValue(0, 100, 1) === 100`. Works for
 * descending ranges too. Callers round/format for display (integers vs money/%).
 */
export function countUpValue(from: number, to: number, progress: number): number {
  return from + (to - from) * easeOutCubic(progress);
}
