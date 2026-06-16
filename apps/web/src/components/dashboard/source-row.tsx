import type { ReactNode } from "react";
import { formatNumber, monogram } from "@/lib/format";

/**
 * Move #1 / Phase D — a single ranked row: avatar + label + a subtle proportional
 * share bar + tabular value.
 *
 * Privacy-first (decision D1): the default avatar is a **monogram/letter** derived
 * from the label — NO third-party favicon service. Phase G adds an optional `icon`
 * override (flags / device glyphs) without changing the Sources/Revenue rows.
 * Dependency-free, monochrome (accent is Move #3).
 */
export function SourceRow({
  label,
  value,
  max,
  format = formatNumber,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  /** Formats the trailing value (defaults to compact number). */
  format?: (value: number) => string;
  /** Overrides the monogram avatar (e.g. a flag emoji or a device icon). */
  icon?: ReactNode;
}) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <li className="relative">
      <div
        className="bg-foreground/5 absolute inset-y-0 left-0 rounded-sm"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div className="relative flex items-center gap-2 px-2 py-1.5 text-sm">
        {icon !== undefined ? (
          <span
            className="flex size-5 shrink-0 items-center justify-center text-sm leading-none"
            aria-hidden
          >
            {icon}
          </span>
        ) : (
          <span
            className="bg-muted text-foreground flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium"
            aria-hidden
          >
            {monogram(label)}
          </span>
        )}
        <span className="truncate">{label}</span>
        <span className="text-muted-foreground ml-auto tabular-nums">
          {format(value)}
        </span>
      </div>
    </li>
  );
}
