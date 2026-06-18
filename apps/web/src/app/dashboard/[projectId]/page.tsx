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
} from "@/server/queries/analytics";
import { getPrimaryFunnel, getFunnelResults } from "@/server/queries/funnels";
import {
  getRevenueSummary,
  getRevenueBySource,
} from "@/server/queries/revenue";
import { getPayPalConnection } from "@/server/queries/integrations";
import { resolveRange, previousRange, rangePeriodWord } from "@/lib/range";
import { buildLede } from "@/lib/lede";
import {
  formatDuration,
  formatMoney,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopPagesCard } from "@/components/dashboard/top-pages-card";
import { SourcesCard } from "@/components/dashboard/sources-card";
import { FunnelMini } from "@/components/dashboard/funnel-mini";
import { RevenueMini } from "@/components/dashboard/revenue-mini";
import { AudienceCard } from "@/components/dashboard/audience-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Delta } from "@/components/dashboard/delta";
import { Lede } from "@/components/dashboard/lede";
import { InstallSnippet } from "@/components/dashboard/install-snippet";
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
  const [
    projects,
    analytics,
    prevMetrics,
    prevSeries,
    activeNow,
    primaryFunnel,
    revenueConnection,
    revenueSummary,
    prevRevenueSummary,
    revenueBySource,
  ] = await Promise.all([
    listProjects(user.id),
    getProjectAnalytics(project.id, from, to),
    getOverviewMetrics(project.id, prev.from, prev.to),
    getTimeseries(project.id, prev.from, prev.to),
    getActiveNow(project.id),
    getPrimaryFunnel(project.id),
    getPayPalConnection(project.id),
    getRevenueSummary(project.id, from, to),
    getRevenueSummary(project.id, prev.from, prev.to),
    getRevenueBySource(project.id, from, to),
  ]);

  // Show the revenue card/KPI when connected or any revenue exists; else a CTA.
  const showRevenue = revenueConnection.connected || revenueSummary.count > 0;

  const { metrics, timeseries } = analytics;
  const hasData = metrics.sessions > 0;
  // Install snippet for the focused empty state (Phase J). Same construction as
  // Settings, kept Overview-local so the Settings page stays untouched.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const installSnippet = `<script defer src="${appUrl}/onemetric.js" data-public-key="${project.publicKey}"></script>`;

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
  // Revenue clause only when there's revenue from a named (attributable) source.
  const topRevenueSource =
    revenueBySource.find((r) => r.label !== "Direct / unknown") ?? null;
  const revenueLede =
    revenueSummary.total > 0 && topRevenueSource
      ? {
          topSource: topRevenueSource.label,
          amount: revenueSummary.total,
          currency: revenueSummary.currency,
          href: `/dashboard/${project.id}/revenue`,
        }
      : null;
  const ledeTokens = buildLede({
    current: metrics,
    previous: prevMetrics,
    periodWord: rangePeriodWord(range),
    projectId: project.id,
    topSource: topSourceLabel ? { label: topSourceLabel } : null,
    funnel: funnelLede,
    revenue: revenueLede,
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

      {/* Range control only — the redundant "Overview" <h2> is removed (Phase J);
          the ProjectHeader tab already names the view (spec §4.0). */}
      <div className="flex items-center justify-end">
        <RangeSelect value={range} />
      </div>

      {!hasData ? (
        // Single focused empty state (spec §7): a live pulse + the copyable
        // install snippet — not a generic "no data" card. Phase J.
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="relative mb-4 flex size-3" aria-hidden>
              <span className="bg-emerald-500/60 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none" />
              <span className="bg-emerald-500 relative inline-flex size-3 rounded-full" />
            </span>
            <p className="text-lg font-medium">Waiting for your first pageview</p>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              Add the snippet to your site&apos;s <code>&lt;head&gt;</code> and your
              analytics appear here automatically — it takes less than a minute.
            </p>
            <div className="mt-6 w-full max-w-xl text-left">
              <InstallSnippet snippet={installSnippet} />
            </div>
            <Link
              href={`/dashboard/${project.id}/settings`}
              className="text-muted-foreground hover:text-foreground mt-4 inline-block text-xs underline-offset-4 hover:underline"
            >
              Full setup &amp; verification →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lede — the briefing sentence (Move #1 / Phase B). */}
          <Lede tokens={ledeTokens} />

          {/* Hero — the protagonist (Move #1 / Phase A; Phase I: shorter chart
              on mobile, full height ≥640). */}
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
                  heightClassName="h-[200px] sm:h-[260px]"
                  ariaLabel="Daily unique visitors, current vs previous period"
                />
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
            {showRevenue ? (
              <StatCard
                label="Revenue"
                value={formatMoney(revenueSummary.total, revenueSummary.currency)}
                delta={{
                  current: revenueSummary.total,
                  previous: prevRevenueSummary.total,
                }}
              />
            ) : (
              <StatCard label="Revenue" pending />
            )}
            <StatCard
              label="Active now"
              value={formatNumber(activeNow)}
              live={activeNow > 0}
            />
          </div>

          {/* Demoted engagement diagnostics (were standalone tiles). Move #1 /
              Phase H: tabular-nums so the figures never jitter (spec §6). */}
          <p className="text-muted-foreground text-xs tabular-nums">
            Bounce {formatPercent(metrics.bounceRate)} ·{" "}
            {metrics.pagesPerSession.toFixed(1)} pages/session ·{" "}
            {formatDuration(metrics.avgDurationSec)} avg session
          </p>

          {/* Outcomes triad (Move #1 / Phase D–F). Three equal cards: Sources /
              Funnel / Revenue. Phase I: on mobile they stack in the spec's order
              (Funnel → Sources → Revenue, §10) via order-*; at ≥768 the natural
              Sources | Funnel | Revenue row returns (order-none). */}
          <div className="grid gap-4 md:grid-cols-3">
            <SourcesCard
              items={analytics.topReferrers}
              className="order-2 md:order-none"
            />
            {primaryFunnel && funnelNow ? (
              <Card className="order-1 md:order-none">
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
              <Card className="order-1 md:order-none">
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
            {showRevenue ? (
              <Card className="order-3 md:order-none">
                <CardHeader>
                  <CardTitle className="text-base">Revenue by source</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueMini
                    sources={revenueBySource}
                    total={revenueSummary.total}
                    currency={revenueSummary.currency}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="order-3 md:order-none">
                <CardHeader>
                  <CardTitle className="text-base">Revenue by source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    No revenue connected.
                  </p>
                  <Link
                    href={`/dashboard/${project.id}/revenue`}
                    className="text-foreground mt-2 inline-block text-sm underline"
                  >
                    Connect revenue →
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detail row (Move #1 / Phase H) — Top pages demoted to <SourceRow>
              styling + the merged Audience card (Phase G). The quiet "footnotes"
              row, below the outcomes triad. */}
          <div className="grid gap-4 md:grid-cols-2">
            <TopPagesCard items={analytics.topPages} />
            <AudienceCard
              countries={analytics.countries}
              devices={analytics.devices}
              browsers={analytics.browsers}
            />
          </div>
        </>
      )}
    </div>
  );
}
