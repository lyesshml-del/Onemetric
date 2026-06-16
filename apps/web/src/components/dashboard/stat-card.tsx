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
 * live dot. `pending` renders a dimmed placeholder for KPIs whose data arrives in a
 * later phase (Signup conversion → Phase E, Revenue → Phase F). Server-safe;
 * reuses the Phase 0 `<Delta>`. Monochrome — accent is Move #3.
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
  value?: string;
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
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40",
        )}
        aria-hidden
      />
      live
    </span>
  );
}
