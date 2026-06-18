import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Move #2 / Phase A — the Overview *content* skeleton (Lede → hero → KPI strip →
 * engagement line → outcomes triad → detail row), mirroring `page.tsx` at the
 * real components' dimensions so streamed content slots in with no layout shift
 * and no blank flash. Uses the real `<Card>` chrome + the Phase-0 `<Skeleton>`
 * (shimmer; static under `prefers-reduced-motion`). Server component, zero client
 * JS.
 *
 * Excludes the project header + range control (route-load chrome) so it can be
 * reused as the in-page pending state in Phase B (optimistic switching).
 */
export function OverviewSkeleton() {
  return (
    <>
      {/* Lede */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-5 w-2/3 max-w-md" />
      </div>

      {/* Hero */}
      <Card>
        <CardContent>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-1 h-9 w-40" />
          <Skeleton className="mt-1 h-3 w-32" />
          <Skeleton className="mt-5 h-[200px] w-full sm:h-[260px]" />
        </CardContent>
      </Card>

      {/* KPI strip — four outcome KPIs (2×2 mobile → 4-across desktop) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1 h-7 w-24" />
            <Skeleton className="mt-3 h-[22px] w-full" />
          </div>
        ))}
      </div>

      {/* Engagement diagnostics line */}
      <Skeleton className="h-4 w-80 max-w-full" />

      {/* Outcomes triad — Sources / Funnel / Revenue */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail row — Top pages + Audience */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
