import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/server/queries/projects";
import { getOwnedFunnel, getFunnelResults } from "@/server/queries/funnels";
import { deleteFunnel } from "@/server/actions/funnels";
import { resolveRange } from "@/lib/range";
import { formatNumber, formatPercent } from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Funnel — OneMetric",
};

export default async function FunnelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; funnelId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { funnelId } = await params;
  const { range: rangeParam } = await searchParams;
  const { user } = await requireUser();

  const funnel = await getOwnedFunnel(user.id, funnelId);
  if (!funnel) notFound();

  const { key: range, from, to } = resolveRange(rangeParam);
  const [projects, results] = await Promise.all([
    listProjects(user.id),
    getFunnelResults(funnel.project.id, funnel.steps, from, to),
  ]);

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={funnel.project.id}
        projectName={funnel.project.name}
        domain={funnel.project.domain}
        projects={projects}
        active="funnels"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/${funnel.project.id}/funnels`}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Funnels
          </Link>
          <h2 className="mt-1 text-xl font-semibold">{funnel.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <RangeSelect value={range} />
          <form action={deleteFunnel}>
            <input type="hidden" name="funnelId" value={funnel.id} />
            <input type="hidden" name="projectId" value={funnel.project.id} />
            <Button type="submit" variant="outline" size="sm">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Entered funnel"
          value={formatNumber(results.entered)}
          hint="Sessions completing step 1"
        />
        <MetricCard
          label="Overall conversion"
          value={formatPercent(results.overallConversion)}
          hint="Step 1 → last step"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {results.entered === 0 ? (
            <p className="text-muted-foreground text-sm">
              No sessions have entered this funnel in the selected period.
            </p>
          ) : (
            <FunnelChart steps={results.steps} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
