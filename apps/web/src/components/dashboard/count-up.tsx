"use client";

import { cn } from "@/lib/utils";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useCountUp } from "@/lib/hooks/use-count-up";

/**
 * Move #2 / Phase C — animate a number up to its final value **once** on arrival
 * (and on data change), via the Phase-0 `useCountUp`. `tabular-nums` keeps the
 * width steady. Reduced-motion / no-JS / SSR → the final value **instantly** (no
 * count, no layout shift).
 *
 * Formatting is chosen by a **serializable** `format` token — not a function,
 * which can't cross the server→client boundary (the hero/KPIs are server-rendered
 * and pass `<CountUp>` in). `"number"` rounds to an integer (counts never show
 * decimals mid-animation); `"percent"` takes a 0..1 fraction; `"money"` uses
 * `currency`. The final displayed value equals the source exactly.
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
  const text =
    format === "money"
      ? formatMoney(current, currency ?? null)
      : format === "percent"
        ? formatPercent(current)
        : formatNumber(Math.round(current));
  return <span className={cn("tabular-nums", className)}>{text}</span>;
}
