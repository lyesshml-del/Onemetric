import { Suspense } from "react";
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
import { formatDuration, formatNumber, formatPercent } from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { OverviewShell } from "@/components/dashboard/overview-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { CountUp } from "@/components/dashboard/count-up";
import { TopPagesCard } from "@/components/dashboard/top-pages-card";
import { SourcesCard } from "@/components/dashboard/sources-card";
import { FunnelMini } from "@/components/dashboard/funnel-mini";
import { RevenueMini } from "@/components/dashboard/revenue-mini";
import { AudienceCard } from "@/components/dashboard/audience-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Delta } from "@/components/dashboard/delta";
import { Lede } from "@/components/dashboard/lede";
import { FirstEventOnboarding } from "@/components/dashboard/first-event-onboarding";
import { FirstValueBanner } from "@/components/dashboard/first-value-banner";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { OverviewSkeleton } from "@/components/dashboard/overview-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Analytics — OneMetric",
};

type OverviewPageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string }>;
};

export default function ProjectOverviewPage(props: OverviewPageProps) {
  // Move #2 / Phase A — stream a layout-matching skeleton while the server
  // resolves analytics (no blank flash, no layout shift). Scoped to the Overview
  // via an in-page Suspense boundary: a route-level loading.tsx here would also
  // flash this skeleton on the sibling tabs (Events/Funnels/…), since there is no
  // [projectId]/layout.tsx.
  return (
    <Suspense fallback={<OverviewLoading />}>
      <OverviewContent {...props} />
    </Suspense>
  );
}

async function OverviewContent({ params, searchParams }: OverviewPageProps) {
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

  // ONE-66 — activation checklist state (no new queries; reuses the Overview's
  // existing data). Steps 1–3 (project / tracking key / first pageview) are done
  // once there's data; the checklist drives funnel + revenue, then hides.
  const hasFunnel = primaryFunnel !== null;
  const hasRevenue = revenueSummary.count > 0;
  const fullyActivated = hasFunnel && hasRevenue;

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

      {/* Move #2 / Phase B — OverviewShell owns the range control + an optimistic
          (useTransition) navigation: the active value flips instantly, the content
          dims + aria-busy while the server re-renders, and scroll is preserved. The
          content is passed as children, so the page stays a server component. */}
      <OverviewShell range={range}>
        {!hasData ? (
        // ONE-65 — first-event onboarding (replaces the Phase J "waiting" panel):
        // the tracking snippet to copy + three plain steps, so a new project
        // always shows what to do next.
        <FirstEventOnboarding
          snippet={installSnippet}
          settingsHref={`/dashboard/${project.id}/settings`}
        />
      ) : (
        <>
          {/* ONE-71 — first-value "aha" banner: a calm acknowledgement that setup
              worked, shown only during the activation window (retires with the
              checklist once fully activated). Celebrates + frames value; the
              checklist below owns the next-step CTAs (no duplication). */}
          {!fullyActivated ? <FirstValueBanner /> : null}

          {/* Lede — the briefing sentence (Move #1 / Phase B). */}
          <Lede tokens={ledeTokens} />

          {/* Hero — the protagonist (Move #1 / Phase A; Phase I: shorter chart
              on mobile, full height ≥640). */}
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-sm">Unique visitors</p>
              <div className="mt-1 flex items-baseline gap-3">
                <CountUp
                  value={metrics.uniqueVisitors}
                  format="number"
                  className="text-4xl font-semibold tracking-tight"
                />
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

          {/* ONE-66 — activation checklist, above the metric cards; hides once the
              project is fully activated (a funnel + revenue both exist). */}
          {!fullyActivated ? (
            <OnboardingChecklist
              hasSession
              hasFunnel={hasFunnel}
              hasRevenue={hasRevenue}
              snippet={installSnippet}
              funnelsHref={`/dashboard/${project.id}/funnels`}
              revenueHref={`/dashboard/${project.id}/revenue`}
            />
          ) : null}

          {/* KPI strip (Move #1 / Phase C) — outcome metrics with delta + sparkline.
              Conversion + Revenue are placed but light up in Phases E + F. */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Pageviews"
              value={<CountUp value={metrics.pageviews} format="number" />}
              delta={{
                current: metrics.pageviews,
                previous: prevMetrics.pageviews,
              }}
              spark={timeseries.map((p) => p.pageviews)}
            />
            {primaryFunnel && funnelNow && funnelPrev ? (
              <StatCard
                label="Signup conversion"
                value={
                  <CountUp value={funnelNow.overallConversion} format="percent" />
                }
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
                value={
                  <CountUp
                    value={revenueSummary.total}
                    format="money"
                    currency={revenueSummary.currency}
                  />
                }
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
              value={<CountUp value={activeNow} format="number" />}
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
      </OverviewShell>
    </div>
  );
}

/**
 * Move #2 / Phase A — the Suspense fallback for the Overview: the project-header
 * skeleton + the range-control placeholder + the shared <OverviewSkeleton>
 * content, in the same `space-y-8` shell as the loaded page (no layout shift).
 */
function OverviewLoading() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-busy="true"
      aria-label="Loading analytics"
    >
      {/* Project header (the header lives in the page — no [projectId]/layout.tsx). */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
        <nav className="border-border flex gap-4 border-b">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-4 w-14" />
          ))}
        </nav>
      </div>

      {/* Range control (right-aligned, like the loaded page). */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-28" />
      </div>

      <OverviewSkeleton />
    </div>
  );
}
