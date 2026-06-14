import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import {
  getProjectAnalytics,
  type BreakdownRow,
} from "@/server/queries/analytics";
import { resolveRange } from "@/lib/range";
import {
  countryName,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { BarChart } from "@/components/charts/bar-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Analytics — OneMetric",
};

export default async function ProjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { projectId } = await params;
  const { range: rangeParam } = await searchParams;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const { key: range, from, to } = resolveRange(rangeParam);
  const [projects, analytics] = await Promise.all([
    listProjects(user.id),
    getProjectAnalytics(project.id, from, to),
  ]);

  const { metrics, timeseries } = analytics;
  const hasData = metrics.sessions > 0;

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="overview"
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Overview</h2>
        <RangeSelect value={range} />
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">No data in this period yet.</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Install the snippet to start collecting analytics.
            </p>
            <Link
              href={`/dashboard/${project.id}/settings`}
              className="text-foreground mt-3 inline-block text-sm underline"
            >
              Go to install instructions →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <MetricCard
              label="Unique visitors"
              value={formatNumber(metrics.uniqueVisitors)}
            />
            <MetricCard label="Sessions" value={formatNumber(metrics.sessions)} />
            <MetricCard
              label="Pageviews"
              value={formatNumber(metrics.pageviews)}
            />
            <MetricCard
              label="Pages / session"
              value={metrics.pagesPerSession.toFixed(1)}
            />
            <MetricCard
              label="Avg. session duration"
              value={formatDuration(metrics.avgDurationSec)}
            />
            <MetricCard
              label="Bounce rate"
              value={formatPercent(metrics.bounceRate)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unique visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={timeseries.map((p) => ({
                  label: p.date,
                  value: p.visitors,
                }))}
              />
              <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                <span>{timeseries[0]?.date}</span>
                <span>{timeseries[timeseries.length - 1]?.date}</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownCard title="Top pages" items={analytics.topPages} />
            <BreakdownCard title="Top referrers" items={analytics.topReferrers} />
            <BreakdownCard
              title="Countries"
              items={mapCountries(analytics.countries)}
            />
            <BreakdownCard
              title="Devices"
              items={mapDevices(analytics.devices)}
            />
            <BreakdownCard title="Browsers" items={analytics.browsers} />
          </div>
        </>
      )}
    </div>
  );
}

function mapCountries(rows: BreakdownRow[]): BreakdownRow[] {
  return rows.map((r) => ({ ...r, label: countryName(r.label) }));
}

function mapDevices(rows: BreakdownRow[]): BreakdownRow[] {
  return rows.map((r) => ({
    ...r,
    label: r.label.charAt(0) + r.label.slice(1).toLowerCase(),
  }));
}
