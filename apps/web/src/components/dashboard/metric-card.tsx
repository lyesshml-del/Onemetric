/**
 * A simple label · value (· optional hint) metric card.
 *
 * Move #3 / Phase D — unified onto the single card spec (`rounded-xl border
 * bg-card`, `text-xs` muted label, `text-2xl tabular-nums` value), so the
 * Events-detail / Funnels-detail / Revenue pages match the Overview's
 * `StatCard`. Same card system: `StatCard` adds delta/sparkline/live; this one
 * adds an optional `hint`. Server-safe; monochrome (accent stays in its zones).
 */
export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  );
}
