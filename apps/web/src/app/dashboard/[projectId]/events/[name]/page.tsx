import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import { getEventDetail } from "@/server/queries/events";
import { resolveRange, isRangeKey, DEFAULT_RANGE } from "@/lib/range";
import { formatNumber } from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/charts/trend-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Event — OneMetric",
};

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; name: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { projectId, name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const { range: rangeParam } = await searchParams;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const { from, to } = resolveRange(rangeParam);
  const rangeQuery = isRangeKey(rangeParam) ? rangeParam : DEFAULT_RANGE;
  const [projects, detail] = await Promise.all([
    listProjects(user.id),
    getEventDetail(project.id, name, from, to),
  ]);

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="events"
      />

      <div>
        <Link
          href={`/dashboard/${project.id}/events?range=${rangeQuery}`}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Events
        </Link>
        <h2 className="mt-1 font-mono text-xl font-semibold">{name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Occurrences" value={formatNumber(detail.count)} />
        <MetricCard
          label="Unique sessions"
          value={formatNumber(detail.sessions)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={detail.trend.map((p) => ({ label: p.date, value: p.count }))}
            accent={false}
            valueLabel="occurrences"
            heightClassName="h-44"
            ariaLabel="Event occurrences over time"
          />
          <div className="text-muted-foreground mt-2 flex justify-between text-xs tabular-nums">
            <span>{detail.trend[0]?.date}</span>
            <span>{detail.trend[detail.trend.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent occurrences</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {detail.recent.length === 0 ? (
            <p className="text-muted-foreground px-4 pb-4 text-sm">
              No occurrences in this period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Time (UTC)</th>
                  <th className="px-4 py-3 text-left font-medium">Path</th>
                  <th className="px-4 py-3 text-left font-medium">Properties</th>
                </tr>
              </thead>
              <tbody>
                {detail.recent.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 align-top">
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap tabular-nums">
                      {o.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3">{o.path ?? "—"}</td>
                    <td className="px-4 py-3">
                      {o.metadata == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <code className="text-xs break-all">
                          {JSON.stringify(o.metadata)}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
