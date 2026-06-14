import { FunnelMatchType } from "@prisma/client";
import { formatNumber, formatPercent } from "@/lib/format";
import type { FunnelStepResult } from "@/server/queries/funnels";

export function FunnelChart({ steps }: { steps: FunnelStepResult[] }) {
  const max = Math.max(1, steps[0]?.count ?? 0);

  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step.order} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate">
              <span className="text-muted-foreground">{i + 1}.</span>{" "}
              {step.matchValue}{" "}
              <span className="text-muted-foreground text-xs">
                {step.matchType === FunnelMatchType.PAGEVIEW_PATH
                  ? "(page)"
                  : "(event)"}
              </span>
            </span>
            <span className="text-muted-foreground whitespace-nowrap tabular-nums">
              {formatNumber(step.count)} · {formatPercent(step.conversion)}
            </span>
          </div>
          <div className="bg-muted h-8 w-full overflow-hidden rounded">
            <div
              className="bg-foreground/70 h-full"
              style={{ width: `${(step.count / max) * 100}%` }}
            />
          </div>
          {i > 0 && step.dropFromPrev > 0 ? (
            <p className="text-muted-foreground text-xs">
              ↓ {formatNumber(step.dropFromPrev)} dropped
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
