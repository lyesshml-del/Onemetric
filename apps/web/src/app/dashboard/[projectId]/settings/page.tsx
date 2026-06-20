import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getOwnedProject,
  getProjectIngestStats,
  listProjects,
} from "@/server/queries/projects";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { InstallGuide } from "@/components/dashboard/install-guide";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { CustomEventsDoc } from "@/components/dashboard/custom-events-doc";
import { DeleteProjectDialog } from "@/components/dashboard/delete-project-dialog";
import { RenameProjectForm } from "@/components/dashboard/rename-project-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings — OneMetric",
};

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const [projects, stats] = await Promise.all([
    listProjects(user.id),
    getProjectIngestStats(project.id),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const snippet = `<script defer src="${appUrl}/onemetric.js" data-public-key="${project.publicKey}"></script>`;
  const receiving = stats.events > 0;

  return (
    <div className="max-w-2xl space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="settings"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Install</CardTitle>
          <CardDescription>
            Add OneMetric to your site to start collecting analytics — it takes
            less than a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstallGuide snippet={snippet} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification</CardTitle>
          <CardDescription>
            {receiving
              ? "OneMetric is receiving data from your site."
              : "Waiting for the first event from your site."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                receiving
                  ? "size-2 rounded-full bg-emerald-500"
                  : "size-2 rounded-full bg-amber-500"
              }
              aria-hidden
            />
            <span>
              {receiving
                ? `Receiving data — ${stats.events} event${stats.events === 1 ? "" : "s"} so far`
                : "No events received yet"}
            </span>
          </div>
          {stats.lastEventAt ? (
            <p className="text-muted-foreground text-sm">
              Last event: {stats.lastEventAt.toUTCString()}
            </p>
          ) : null}
          <RefreshButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom events</CardTitle>
          <CardDescription>
            Track signups, purchases, clicks and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomEventsDoc />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Rename this project. Your analytics and existing data are unaffected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RenameProjectForm
            projectId={project.id}
            projectName={project.name}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base">Danger Zone</CardTitle>
          <CardDescription>
            Deleting a project permanently removes all analytics and associated
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteProjectDialog
            projectId={project.id}
            projectName={project.name}
          />
        </CardContent>
      </Card>
    </div>
  );
}
