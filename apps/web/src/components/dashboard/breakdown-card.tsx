import { formatNumber } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type BreakdownItem = { label: string; value: number };

export function BreakdownCard({
  title,
  items,
  emptyLabel = "No data yet",
  format = formatNumber,
}: {
  title: string;
  items: BreakdownItem[];
  emptyLabel?: string;
  format?: (value: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={`${item.label}-${i}`} className="relative">
                <div
                  className="bg-muted absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: `${(item.value / max) * 100}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center justify-between px-2 py-1.5 text-sm">
                  <span className="truncate pr-2">{item.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {format(item.value)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
