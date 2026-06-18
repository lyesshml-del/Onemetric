import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SourceRow } from "@/components/dashboard/source-row";
import type { BreakdownRow } from "@/server/queries/analytics";

/**
 * Move #1 / Phase D — "Top sources" (slot 1 of the outcomes triad): where traffic
 * comes from, ranked, with monogram avatars + share bars. Answers the Overview's
 * "where does traffic come from?" question. Reuses the existing `topReferrers`
 * data — no new query. Capped to the top few so the triad cards stay balanced.
 */
export function SourcesCard({
  items,
  className,
}: {
  items: BreakdownRow[];
  className?: string;
}) {
  const top = items.slice(0, 6);
  const max = Math.max(1, ...top.map((i) => i.value));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Top sources</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-muted-foreground text-sm">No referrers yet</p>
        ) : (
          <ul className="space-y-0.5">
            {top.map((item, i) => (
              <SourceRow
                key={`${item.label}-${i}`}
                label={item.label}
                value={item.value}
                max={max}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
