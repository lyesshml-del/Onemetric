"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";

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
 * overlays so non-uniform scaling never distorts them. Monochrome by design —
 * the accent color is Move #3.
 */
export function TrendChart({
  data,
  valueLabel = "",
  height = 260,
  ariaLabel = "Trend",
}: {
  data: TrendPoint[];
  valueLabel?: string;
  height?: number;
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

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
      className="relative w-full"
      style={{ height }}
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
        <path d={area} className="fill-foreground/10" />
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
        <path
          d={line("value") ?? ""}
          fill="none"
          className="stroke-foreground"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
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
