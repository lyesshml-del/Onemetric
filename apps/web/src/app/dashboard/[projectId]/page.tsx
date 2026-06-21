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
import { hasReportSubscription } from "@/server/queries/reports";
import { resolveRange, previousRange, rangePeriodWord } from "@/lib/range";
import { cn } from "@/lib/utils";
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
import { SetupGuide } from "@/components/dashboard/setup-guide";
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
    hasReports,
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
    hasReportSubscription(project.id),
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
  // once there's data; the checklist nudges funnel + revenue.
  const hasFunnel = primaryFunnel !== null;
  const hasRevenue = revenueSummary.count > 0;
  // ONE-74 — smarter activation: we're already in the `hasData` (first-pageview)
  // branch, so "activated" = traffic + engagement with EITHER a funnel OR revenue
  // (no longer both — revenue is optional). Traffic-only users who'll never set
  // up either can dismiss the onboarding (handled client-side per project).
  const fullyActivated = hasFunnel || hasRevenue;

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

  // ONE-78 — progressive disclosure: surface only the KPIs that carry real data,
  // instead of dimmed "—" placeholders. Pageviews + Active now are always
  // meaningful once there's traffic; Signup conversion appears with a funnel and
  // Revenue with a connection/revenue. A fully-populated project still shows all
  // four in a `lg:grid-cols-4` grid (identical to before).
  const kpiCards = [
    <StatCard
      key="pageviews"
      label="Pageviews"
      value={<CountUp value={metrics.pageviews} format="number" />}
      delta={{ current: metrics.pageviews, previous: prevMetrics.pageviews }}
      spark={timeseries.map((p) => p.pageviews)}
    />,
  ];
  if (primaryFunnel && funnelNow && funnelPrev) {
    kpiCards.push(
      <StatCard
        key="conversion"
        label="Signup conversion"
        value={<CountUp value={funnelNow.overallConversion} format="percent" />}
        delta={{
          current: funnelNow.overallConversion,
          previous: funnelPrev.overallConversion,
          mode: "points",
        }}
      />,
    );
  }
  if (showRevenue) {
    kpiCards.push(
      <StatCard
        key="revenue"
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
      />,
    );
  }
  kpiCards.push(
    <StatCard
      key="active"
      label="Active (5 min)"
      value={<CountUp value={activeNow} format="number" />}
      live={activeNow > 0}
    />,
  );
  const kpiColsClass =
    kpiCards.length === 4
      ? "lg:grid-cols-4"
      : kpiCards.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

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
        // ONE-76 — the canonical setup surface, inline on the Overview empty
        // state (identical to Settings): Install + Verification (with ONE-72
        // auto-verify, which auto-transitions this into the live dashboard once
        // the first event lands, and the ONE-73 test-event path). No hop to
        // Settings needed.
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium">Finish setting up {project.name}</h2>
            <p className="text-muted-foreground text-sm">
              Add the snippet and your analytics start flowing — cookieless, no
              banner, no PII.
            </p>
          </div>
          <SetupGuide
            snippet={installSnippet}
            publicKey={project.publicKey}
            events={0}
            lastEventAt={null}
            overviewHref={`/dashboard/${project.id}`}
            showDashboardLink={false}
          />
        </div>
      ) : (
        <>
          {/* ONE-71 — first-value "aha" banner: a calm acknowledgement that setup
              worked, shown only during the activation window (retires with the
              checklist once fully activated). Celebrates + frames value; the
              checklist below owns the next-step CTAs (no duplication). */}
          {!fullyActivated ? <FirstValueBanner projectId={project.id} /> : null}

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
              projectId={project.id}
              hasSession
              hasFunnel={hasFunnel}
              hasRevenue={hasRevenue}
              hasReports={hasReports}
              snippet={installSnippet}
              funnelsHref={`/dashboard/${project.id}/funnels`}
              revenueHref={`/dashboard/${project.id}/revenue`}
              reportsHref={`/dashboard/${project.id}/reports`}
            />
          ) : null}

          {/* KPI strip (Move #1 / Phase C; ONE-78 progressive disclosure) —
              only the KPIs with real data; the grid adapts to their count. */}
          <div className={cn("grid grid-cols-2 gap-4", kpiColsClass)}>
            {kpiCards}
          </div>

          {/* Demoted engagement diagnostics (were standalone tiles). Move #1 /
              Phase H: tabular-nums so the figures never jitter (spec §6). */}
          <p className="text-muted-foreground text-xs tabular-nums">
            Bounce {formatPercent(metrics.bounceRate)} ·{" "}
            {metrics.pagesPerSession.toFixed(1)} pages/session ·{" "}
            {formatDuration(metrics.avgDurationSec)} avg session
          </p>

          {/* ONE-78 — progressive disclosure: once the project is activated (a
              funnel or revenue exists, ONE-74) show the full Move #1 outcomes
              triad + detail row exactly as before. Below that threshold, a
              low-data project gets one curated breakdowns grid instead — no
              funnel/revenue placeholders (the checklist already guides setup). */}
          {fullyActivated ? (
            <>
              {/* Outcomes triad (Move #1 / Phase D–F). Three equal cards: Sources /
                  Funnel / Revenue. Phase I: on mobile they stack in the spec's
                  order (Funnel → Sources → Revenue, §10) via order-*; at ≥768 the
                  natural Sources | Funnel | Revenue row returns (order-none). */}
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
                  styling + the merged Audience card (Phase G). The quiet
                  "footnotes" row, below the outcomes triad. */}
              <div className="grid gap-4 md:grid-cols-2">
                <TopPagesCard items={analytics.topPages} />
                <AudienceCard
                  countries={analytics.countries}
                  devices={analytics.devices}
                  browsers={analytics.browsers}
                />
              </div>
            </>
          ) : (
            // ONE-78 — low-data breakdowns: only the cards that carry value
            // (Sources, Top pages, Audience); the funnel/revenue placeholders are
            // omitted while the onboarding checklist guides setting those up.
            <div className="grid gap-4 md:grid-cols-3">
              <SourcesCard items={analytics.topReferrers} />
              <TopPagesCard items={analytics.topPages} />
              <AudienceCard
                countries={analytics.countries}
                devices={analytics.devices}
                browsers={analytics.browsers}
              />
            </div>
          )}
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
