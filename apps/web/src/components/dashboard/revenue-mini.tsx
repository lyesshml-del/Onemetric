import { formatMoney } from "@/lib/format";
import { SourceRow } from "@/components/dashboard/source-row";
import type { RevenueBreakdownRow } from "@/server/queries/revenue";

/**
 * Move #1 / Phase F — revenue by source (triad slot 3). Reuses `<SourceRow>` with
 * money formatting (monogram avatars per D1) + an emphasized total, matching
 * `SourcesCard` / `FunnelMini`. Server-safe, dependency-free, monochrome
 * (accent is Move #3). The detailed revenue view stays at /revenue.
 */
export function RevenueMini({
  sources,
  total,
  currency,
}: {
  sources: RevenueBreakdownRow[];
  total: number;
  currency: string | null;
}) {
  const top = sources.slice(0, 5);
  const max = Math.max(1, ...top.map((s) => s.value));
  const money = (v: number) => formatMoney(v, currency);

  return (
    <div className="space-y-3">
      {top.length === 0 ? (
        <p className="text-muted-foreground text-sm">No revenue yet</p>
      ) : (
        <ul className="space-y-0.5">
          {top.map((s, i) => (
            <SourceRow
              key={`${s.label}-${i}`}
              label={s.label}
              value={s.value}
              max={max}
              format={money}
            />
          ))}
        </ul>
      )}
      <div className="flex items-baseline justify-between border-t pt-2 text-sm">
        <span className="text-muted-foreground text-xs">Total</span>
        <span className="font-semibold tabular-nums">{money(total)}</span>
      </div>
    </div>
  );
}
