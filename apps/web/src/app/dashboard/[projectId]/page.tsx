import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import {
  getProjectAnalytics,
  getOverviewMetrics,
  getTimeseries,
  getActiveNow,
  type BreakdownRow,
} from "@/server/queries/analytics";
import { getPrimaryFunnel, getFunnelResults } from "@/server/queries/funnels";
import { resolveRange, previousRange, rangePeriodWord } from "@/lib/range";
import { buildLede } from "@/lib/lede";
import {
  countryName,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { SourcesCard } from "@/components/dashboard/sources-card";
import { FunnelMini } from "@/components/dashboard/funnel-mini";
import { TrendChart } from "@/components/charts/trend-chart";
import { Delta } from "@/components/dashboard/delta";
import { Lede } from "@/components/dashboard/lede";
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
  const prev = previousRange(from, to);
  const [projects, analytics, prevMetrics, prevSeries, activeNow, primaryFunnel] =
    await Promise.all([
      listProjects(user.id),
      getProjectAnalytics(project.id, from, to),
      getOverviewMetrics(project.id, prev.from, prev.to),
      getTimeseries(project.id, prev.from, prev.to),
      getActiveNow(project.id),
      getPrimaryFunnel(project.id),
    ]);

  const { metrics, timeseries } = analytics;
  const hasData = metrics.sessions > 0;

  // Primary funnel (Phase E, decision E1 = oldest funnel). Compute conversion for
  // the current + previous windows so the KPI can show a delta. Reuses getFunnelResults.
  const [funnelNow, funnelPrev] = primaryFunnel
    ? await Promise.all([
        getFunnelResults(project.id, primaryFunnel.steps, from, to),
        getFunnelResults(project.id, primaryFunnel.steps, prev.from, prev.to),
      ])
    : [null, null];

  // Hero: current visitors trend with the previous period aligned per day slot.
  const heroPoints = timeseries.map((p, i) => ({
    label: p.date,
    value: p.visitors,
    prev: prevSeries[i]?.visitors,
  }));

  // Lede (Phase B): traffic + top-source. The source uses the existing top
  // referrer; no drill link yet (the Sources view arrives in Phase D).
  const topSourceLabel = analytics.topReferrers[0]?.label ?? null;
  // Funnel clause only when the primary funnel actually had entrants this period.
  const funnelLede =
    primaryFunnel && funnelNow && funnelNow.entered > 0
      ? {
          name: primaryFunnel.name,
          conversion: funnelNow.overallConversion,
          href: `/dashboard/${project.id}/funnels/${primaryFunnel.id}`,
        }
      : null;
  const ledeTokens = buildLede({
    current: metrics,
    previous: prevMetrics,
    periodWord: rangePeriodWord(range),
    projectId: project.id,
    topSource: topSourceLabel ? { label: topSourceLabel } : null,
    funnel: funnelLede,
  });

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
          {/* Lede — the briefing sentence (Move #1 / Phase B). */}
          <Lede tokens={ledeTokens} />

          {/* Hero — the protagonist (Move #1 / Phase A). The tiles + breakdowns
              below are intentionally unchanged; later phases replace them. */}
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-sm">Unique visitors</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {formatNumber(metrics.uniqueVisitors)}
                </span>
                <Delta
                  current={metrics.uniqueVisitors}
                  previous={prevMetrics.uniqueVisitors}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                vs {formatNumber(prevMetrics.uniqueVisitors)} last period
              </p>
              <div className="mt-5">
                <TrendChart
                  data={heroPoints}
                  valueLabel="visitors"
                  ariaLabel="Daily unique visitors, current vs previous period"
                />
              </div>
              <div className="text-muted-foreground mt-2 flex justify-between text-xs tabular-nums">
                <span>{heroPoints[0]?.label}</span>
                <span>{heroPoints[heroPoints.length - 1]?.label}</span>
              </div>
            </CardContent>
          </Card>

          {/* KPI strip (Move #1 / Phase C) — outcome metrics with delta + sparkline.
              Conversion + Revenue are placed but light up in Phases E + F. */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Pageviews"
              value={formatNumber(metrics.pageviews)}
              delta={{
                current: metrics.pageviews,
                previous: prevMetrics.pageviews,
              }}
              spark={timeseries.map((p) => p.pageviews)}
            />
            {primaryFunnel && funnelNow && funnelPrev ? (
              <StatCard
                label="Signup conversion"
                value={formatPercent(funnelNow.overallConversion)}
                delta={{
                  current: funnelNow.overallConversion,
                  previous: funnelPrev.overallConversion,
                  mode: "points",
                }}
              />
            ) : (
              <StatCard label="Signup conversion" pending />
            )}
            <StatCard label="Revenue" pending />
            <StatCard
              label="Active now"
              value={formatNumber(activeNow)}
              live={activeNow > 0}
            />
          </div>

          {/* Demoted engagement diagnostics (were standalone tiles). */}
          <p className="text-muted-foreground text-xs">
            Bounce {formatPercent(metrics.bounceRate)} ·{" "}
            {metrics.pagesPerSession.toFixed(1)} pages/session ·{" "}
            {formatDuration(metrics.avgDurationSec)} avg session
          </p>

          {/* Outcomes triad (Move #1 / Phase D). Sources is live (top referrers
              with monogram avatars — D1, no third-party favicons); Signup funnel
              + Revenue are placed but light up in Phases E + F. */}
          <div className="grid gap-4 md:grid-cols-3">
            <SourcesCard items={analytics.topReferrers} />
            {primaryFunnel && funnelNow ? (
              <Card>
                <CardHeader>
                  <CardTitle className="truncate text-base">
                    {primaryFunnel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FunnelMini results={funnelNow} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">No funnel yet.</p>
                  <Link
                    href={`/dashboard/${project.id}/funnels`}
                    className="text-foreground mt-2 inline-block text-sm underline"
                  >
                    Create a funnel →
                  </Link>
                </CardContent>
              </Card>
            )}
            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="text-base">Revenue by source</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">—</p>
              </CardContent>
            </Card>
          </div>

          {/* Detail row (transitional — referrers moved to the triad above).
              Audience merge + Top pages demotion are Phases G/H. */}
          <div className="grid gap-4 md:grid-cols-2">
            <BreakdownCard title="Top pages" items={analytics.topPages} />
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
