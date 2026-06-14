import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import { getEventSummary } from "@/server/queries/events";
import { resolveRange } from "@/lib/range";
import { formatNumber } from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { CustomEventsDoc } from "@/components/dashboard/custom-events-doc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Events — OneMetric",
};

export default async function EventsPage({
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
  const [projects, events] = await Promise.all([
    listProjects(user.id),
    getEventSummary(project.id, from, to),
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

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Custom events</h2>
        <RangeSelect value={range} />
      </div>

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No custom events yet</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomEventsDoc />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Event</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Occurrences
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.name} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/${project.id}/events/${encodeURIComponent(e.name)}?range=${range}`}
                        className="hover:underline"
                      >
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatNumber(e.count)}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-right tabular-nums">
                      {formatNumber(e.sessions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
