import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getOwnedProject,
  getProjectIngestStats,
  listProjects,
} from "@/server/queries/projects";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { SetupGuide } from "@/components/dashboard/setup-guide";
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

  return (
    <div className="max-w-2xl space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="settings"
      />

      {/* ONE-76 — the canonical setup surface (Install + Verification), shared
          verbatim with the Overview empty state. */}
      <SetupGuide
        snippet={snippet}
        publicKey={project.publicKey}
        events={stats.events}
        lastEventAt={stats.lastEventAt}
        overviewHref={`/dashboard/${project.id}`}
      />

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
