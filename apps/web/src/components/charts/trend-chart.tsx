"use client";

import { useId, useState } from "react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TrendPoint = {
  label: string;
  value: number;
  /** Same-slot value in the previous period (for the ghosted comparison line). */
  prev?: number;
};

/**
 * Move #1 / Phase A — the Overview hero chart.
 *
 * Dependency-free area + line with a ghosted previous-period comparison line and
 * a branded hover tooltip. The lines/area live in a stretch-to-fit SVG (crisp via
 * `vector-effect="non-scaling-stroke"`); the crosshair, dot, and tooltip are HTML
 * overlays so non-uniform scaling never distorts them.
 *
 * Move #3 / Phase A — the signature accent: for the hero (`accent` default true)
 * the CURRENT-period value line (`stroke-brand`) and the area fill (a `--brand` →
 * transparent gradient) carry the accent — "this is the data." The previous-period
 * comparison line, gridlines, crosshair, hover dot, and tooltip stay NEUTRAL (accent
 * = the line + fill only). Pass `accent={false}` for the same crafted chart in
 * neutral monochrome (e.g. the events-detail trend) — the accent stays the hero's
 * alone (MOVE-3-SPEC §4.4: "not on every chart").
 */
export function TrendChart({
  data,
  valueLabel = "",
  height = 260,
  heightClassName,
  ariaLabel = "Trend",
  accent = true,
}: {
  data: TrendPoint[];
  valueLabel?: string;
  height?: number;
  /**
   * Responsive height utilities (e.g. "h-[200px] sm:h-[260px]"). When set it
   * overrides the inline `height`, letting the hero be shorter on mobile and
   * keep its desktop height (Move #1 / Phase I).
   */
  heightClassName?: string;
  ariaLabel?: string;
  /**
   * Whether the value line + area fill carry the signature accent. Default `true`
   * for the Overview hero — the one protagonist series. Other consumers (e.g. the
   * events-detail trend) pass `accent={false}` for the same crafted chart in
   * neutral monochrome, keeping the accent the hero's alone (MOVE-3-SPEC §4.4).
   */
  accent?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  // Unique gradient id; useId()'s colons are stripped so `url(#id)` is valid.
  const gradientId = `trend-area-${useId().replace(/:/g, "")}`;
  // The series colour: the accent for the hero (default), neutral foreground for
  // every other consumer — so the accent never creeps beyond the hero series.
  const seriesColor = accent ? "var(--brand)" : "var(--foreground)";

  const n = data.length;
  const W = 1000;
  const H = 100;
  const padY = 6;
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.prev ?? 0)));
  const hasPrev = data.some((d) => d.prev !== undefined);

  // viewBox-space mappings (SVG)
  const vx = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const vy = (v: number) => H - padY - (v / max) * (H - padY * 2);
  // container-% mappings (HTML overlays)
  const leftPct = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const topPct = (v: number) => ((H - padY - (v / max) * (H - padY * 2)) / H) * 100;

  const line = (key: "value" | "prev") =>
    data
      .map((d, i) => {
        const v = key === "value" ? d.value : d.prev;
        if (v === undefined) return null;
        return `${i === 0 ? "M" : "L"}${vx(i).toFixed(2)},${vy(v).toFixed(2)}`;
      })
      .filter(Boolean)
      .join(" ");

  const area =
    n > 0
      ? `M${vx(0)},${H} ` +
        data.map((d, i) => `L${vx(i).toFixed(2)},${vy(d.value).toFixed(2)}`).join(" ") +
        ` L${vx(n - 1)},${H} Z`
      : "";

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (n <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(ratio * (n - 1)))));
  }

  const hp = hover !== null ? data[hover] : null;

  return (
    <div
      className={cn("relative w-full", heightClassName)}
      style={heightClassName ? undefined : { height }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Move #3 / Phase A — accent area fill: --brand fading to transparent.
            stopColor uses var(--brand) via style so it resolves per theme (dark/light). */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: seriesColor, stopOpacity: 0.25 }} />
            <stop offset="100%" style={{ stopColor: seriesColor, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={vy(max * g)}
            y2={vy(max * g)}
            className="stroke-border"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        {hasPrev ? (
          <path
            d={line("prev") ?? ""}
            fill="none"
            className="stroke-muted-foreground/40"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {/* Move #2 / Phase D — the line draws in once on mount: pathLength=1
            normalizes the length so the `draw-in` keyframe (stroke-dashoffset
            1→0) reveals it regardless of the real, non-uniformly-scaled length.
            non-scaling-stroke is kept for the crisp constant-width stroke. */}
        <path
          d={line("value") ?? ""}
          fill="none"
          className={cn(accent ? "stroke-brand" : "stroke-foreground", "animate-draw-in")}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
        />
      </svg>

      {/* quiet y-axis labels (desktop only) */}
      <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 hidden flex-col justify-between py-[2px] text-[10px] tabular-nums sm:flex">
        <span>{formatNumber(max)}</span>
        <span>0</span>
      </div>

      {/* hover decorations as HTML overlays (undistorted) */}
      {hp ? (
        <>
          <div
            className="bg-border pointer-events-none absolute inset-y-0 w-px"
            style={{ left: `${leftPct(hover!)}%` }}
            aria-hidden
          />
          <div
            className="border-background bg-foreground pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ left: `${leftPct(hover!)}%`, top: `${topPct(hp.value)}%` }}
            aria-hidden
          />
          <div
            className="bg-popover text-popover-foreground pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border px-2 py-1 text-xs shadow-md"
            style={{ left: `${leftPct(hover!)}%` }}
          >
            <div className="text-muted-foreground">{hp.label}</div>
            <div className="font-medium tabular-nums">
              {formatNumber(hp.value)}
              {valueLabel ? ` ${valueLabel}` : ""}
            </div>
            {hp.prev !== undefined ? (
              <div className="text-muted-foreground tabular-nums">
                vs {formatNumber(hp.prev)} prev
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
