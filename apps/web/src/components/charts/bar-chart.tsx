export type BarDatum = { label: string; value: number };

/**
 * Minimal dependency-free bar chart (SVG). Bars carry a native <title> for
 * hover tooltips. Scales to the container width.
 */
export function BarChart({ data }: { data: BarDatum[] }) {
  const width = 720;
  const height = 180;
  const padX = 8;
  const padY = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = Math.max(1, data.length);
  const slot = (width - padX * 2) / n;
  const barWidth = Math.max(1, slot - 3);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-44 w-full"
      role="img"
      aria-label="Daily visitors"
      preserveAspectRatio="none"
    >
      {data.map((d, i) => {
        const h = (d.value / max) * (height - padY * 2);
        const x = padX + i * slot;
        const y = height - padY - h;
        return (
          <rect
            key={d.label}
            x={x}
            y={y}
            width={barWidth}
            height={Math.max(h, d.value > 0 ? 2 : 0)}
            rx="2"
            className="fill-foreground/70"
          >
            <title>{`${d.label}: ${d.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
