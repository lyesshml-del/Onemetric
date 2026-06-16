import { cn } from "@/lib/utils";
import {
  computeDelta,
  formatDeltaPct,
  formatDeltaPoints,
  type DeltaDirection,
} from "@/lib/format";

const GLYPH: Record<DeltaDirection, string> = { up: "▲", down: "▼", flat: "→" };
const TONE: Record<DeltaDirection, string> = {
  up: "text-emerald-500",
  down: "text-red-500",
  flat: "text-muted-foreground",
};

/**
 * Move #1 / Phase 0 — shared period-over-period change badge.
 *
 * The glyph always shows the raw direction; the color shows whether that
 * direction is *good or bad* (`invert` for metrics where down is good, e.g.
 * bounce rate / drop-off). `mode="points"` renders a percentage-point delta for
 * rates. When there is no baseline (new project), it stays neutral ("—").
 *
 * Presentational + dependency-free → safe as a server component. Reused by the
 * Hero (Phase A) and the KPI strip (Phase C). Not rendered anywhere in Phase 0.
 */
export function Delta({
  current,
  previous,
  mode = "percent",
  invert = false,
  className,
}: {
  current: number;
  previous: number;
  mode?: "percent" | "points";
  invert?: boolean;
  className?: string;
}) {
  const { direction, pct, abs } = computeDelta(current, previous);

  // No baseline to compare against (e.g. a brand-new project): stay neutral.
  const noBaseline = mode === "percent" && pct === null;

  const tone: DeltaDirection =
    noBaseline || direction === "flat"
      ? "flat"
      : invert
        ? direction === "up"
          ? "down"
          : "up"
        : direction;

  const label = noBaseline
    ? "—"
    : mode === "points"
      ? formatDeltaPoints(abs)
      : formatDeltaPct(pct);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        TONE[tone],
        className,
      )}
    >
      {!noBaseline && direction !== "flat" ? (
        <span aria-hidden>{GLYPH[direction]}</span>
      ) : null}
      {label}
    </span>
  );
}
