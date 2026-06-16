/**
 * Move #1 / Phase C — tiny dependency-free sparkline (area + line).
 *
 * Static (no hover) → server-safe. Stretch-to-fit SVG with a crisp line via
 * `vector-effect="non-scaling-stroke"`. Decorative: the KPI value + delta carry
 * the meaning, so it's `aria-hidden`. Monochrome — accent is Move #3.
 */
export function Sparkline({
  data,
  height = 22,
}: {
  data: number[];
  height?: number;
}) {
  const n = data.length;
  const W = 100;
  const H = 24;
  const padY = 2;
  const max = Math.max(1, ...data);
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);

  if (n === 0) return null;

  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");
  const area =
    `M${x(0)},${H} ` +
    data.map((v, i) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ") +
    ` L${x(n - 1)},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-hidden
    >
      <path d={area} className="fill-foreground/10" />
      <path
        d={line}
        fill="none"
        className="stroke-foreground/60"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
