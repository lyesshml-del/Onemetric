import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SourceRow } from "@/components/dashboard/source-row";
import type { BreakdownRow } from "@/server/queries/analytics";

/**
 * Move #1 / Phase H — "Top pages" in the demoted detail row (beside Audience).
 * Reuses `<SourceRow>` so the page's "footnotes" share the exact monogram-avatar
 * + share-bar + tabular-value styling of the Sources/Audience cards (one system).
 * Pages have no favicon, so the privacy-safe monogram default applies (decision
 * D1) — no icon override, mirroring `<SourcesCard>`. Reuses the existing
 * `topPages` data (`getTopPages`); no new query. Monochrome — accent is Move #3.
 */
export function TopPagesCard({ items }: { items: BreakdownRow[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top pages</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pageviews yet</p>
        ) : (
          <ul className="space-y-0.5">
            {items.map((item, i) => (
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
