import {
  getOverviewMetrics,
  getTopPages,
  type OverviewMetrics,
  type BreakdownRow,
} from "@/server/queries/analytics";

export type WeeklyReport = {
  projectName: string;
  domain: string;
  periodStart: Date;
  periodEnd: Date;
  metrics: OverviewMetrics;
  topPages: BreakdownRow[];
};

/** Builds the weekly summary (last 7 days) for a project. Templated, no AI. */
export async function buildWeeklyReport(project: {
  id: string;
  name: string;
  domain: string;
}): Promise<WeeklyReport> {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [metrics, topPages] = await Promise.all([
    getOverviewMetrics(project.id, from, to),
    getTopPages(project.id, from, to),
  ]);

  return {
    projectName: project.name,
    domain: project.domain,
    periodStart: from,
    periodEnd: to,
    metrics,
    topPages: topPages.slice(0, 5),
  };
}
