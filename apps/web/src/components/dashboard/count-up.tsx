"use client";

import { cn } from "@/lib/utils";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useCountUp } from "@/lib/hooks/use-count-up";

/**
 * Move #2 / Phase C (Phase G hardening) — render a number that counts up on data
 * change (via the Phase-0 `useCountUp`), formatted by a serializable token.
 *
 * An invisible **ghost** of the final value reserves the width, and the live value
 * is overlaid on top, so the count never shifts neighbours (e.g. the delta badge).
 * `tabular-nums` keeps digit widths even. Reduced-motion / SSR / initial mount →
 * the final value instantly. The final displayed value equals the source exactly.
 *
 * Formatting is chosen by a **serializable** `format` token — not a function, which
 * can't cross the server→client boundary (the hero/KPIs are server-rendered and
 * pass `<CountUp>` in). `"number"` rounds to an integer; `"percent"` takes a 0..1
 * fraction; `"money"` uses `currency`.
 */
export function CountUp({
  value,
  format,
  currency,
  className,
}: {
  value: number;
  format: "number" | "percent" | "money";
  currency?: string | null;
  className?: string;
}) {
  const current = useCountUp(value);
  const fmt = (n: number) =>
    format === "money"
      ? formatMoney(n, currency ?? null)
      : format === "percent"
        ? formatPercent(n)
        : formatNumber(Math.round(n));
  return (
    <span className={cn("relative inline-block tabular-nums", className)}>
      {/* Ghost reserves the final width so neighbours never shift mid-count. */}
      <span aria-hidden className="invisible">
        {fmt(value)}
      </span>
      <span className="absolute top-0 left-0 whitespace-nowrap">{fmt(current)}</span>
    </span>
  );
}
