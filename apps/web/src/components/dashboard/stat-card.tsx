import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Delta } from "@/components/dashboard/delta";
import { Sparkline } from "@/components/charts/sparkline";

type DeltaInput = {
  current: number;
  previous: number;
  mode?: "percent" | "points";
  invert?: boolean;
};

/**
 * Move #1 / Phase C — a single KPI in the Overview strip.
 *
 * One unified card spec (`rounded-xl border bg-card`, matching the hero +
 * breakdown cards): label · value · optional delta · optional sparkline · optional
 * activity dot. `pending` renders a dimmed placeholder for KPIs whose data arrives
 * in a later phase (Signup conversion → Phase E, Revenue → Phase F). Server-safe;
 * reuses the Phase 0 `<Delta>`. Monochrome — accent is Move #3.
 *
 * ONE-80 — the dot is a calm, static presence indicator (emerald when there is
 * recent activity, muted otherwise). It is deliberately NOT pulsing and carries
 * no "live" wording: the value is a page-load snapshot, not a realtime stream, so
 * the honest timeframe lives in the caller's label (e.g. "Active (5 min)").
 */
export function StatCard({
  label,
  value,
  delta,
  spark,
  live,
  pending = false,
}: {
  label: string;
  value?: ReactNode;
  delta?: DeltaInput;
  spark?: number[];
  live?: boolean;
  pending?: boolean;
}) {
  return (
    <div className={cn("bg-card rounded-xl border p-4", pending && "opacity-60")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">{label}</p>
        {live !== undefined ? <LiveDot active={live} /> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {pending ? "—" : (value ?? "—")}
        </span>
        {delta && !pending ? <Delta {...delta} className="text-xs" /> : null}
      </div>
      {spark && spark.length > 0 && !pending ? (
        <div className="mt-3">
          <Sparkline data={spark} />
        </div>
      ) : null}
    </div>
  );
}

function LiveDot({ active }: { active: boolean }) {
  // Static presence dot — no pulse, no "live" wording (the value is a snapshot,
  // not a realtime stream; the timeframe is in the card's label). ONE-80.
  return (
    <span
      className={cn(
        "size-1.5 rounded-full",
        active ? "bg-emerald-500" : "bg-muted-foreground/40",
      )}
      aria-hidden
    />
  );
}
