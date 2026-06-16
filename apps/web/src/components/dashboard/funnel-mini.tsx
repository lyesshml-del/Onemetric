import { formatPercent } from "@/lib/format";
import type { FunnelResults } from "@/server/queries/funnels";

/**
 * Move #1 / Phase E — compact funnel for the Overview triad (slot 2). Each step:
 * label + thin proportional bar + conversion vs the first step; the overall
 * conversion is emphasized at the bottom. Reuses the existing `FunnelResults`
 * (computed by `getFunnelResults`). Server-safe, dependency-free, monochrome
 * (accent is Move #3). The detailed funnel view stays at /funnels/[id].
 */
export function FunnelMini({ results }: { results: FunnelResults }) {
  const max = Math.max(1, results.steps[0]?.count ?? 0);

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {results.steps.map((step, i) => (
          <li key={step.order} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate">
                <span className="text-muted-foreground">{i + 1}.</span>{" "}
                {step.matchValue}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {formatPercent(step.conversion)}
              </span>
            </div>
            <div className="bg-foreground/5 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-foreground/60 h-full rounded-full"
                style={{ width: `${(step.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <div className="flex items-baseline justify-between border-t pt-2 text-sm">
        <span className="text-muted-foreground text-xs">Overall conversion</span>
        <span className="font-semibold tabular-nums">
          {formatPercent(results.overallConversion)}
        </span>
      </div>
    </div>
  );
}
