import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/server/queries/projects";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { DeleteProjectDialog } from "@/components/dashboard/delete-project-dialog";
import { DeletedToast } from "@/components/dashboard/deleted-toast";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — OneMetric",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { user } = await requireUser();
  const { deleted } = await searchParams;
  const projects = await listProjects(user.id);

  return (
    <div className="space-y-8">
      {deleted ? <DeletedToast name={deleted} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Create a project, install the snippet, and your analytics start
            flowing.
          </p>
        </div>
        {/* ONE-67 — header create action (shown when projects exist; the empty
            state carries its own CTA). No inline form on the page. */}
        {projects.length > 0 ? <CreateProjectDialog /> : null}
      </div>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id} className="relative">
              <Link href={`/dashboard/${project.id}`} className="block">
                <Card className="hover:border-foreground/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="truncate pr-8 text-base">
                      {project.name}
                    </CardTitle>
                    <CardDescription>{project.domain}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              {/* Quick delete — reuses the ONE-63 delete dialog (icon trigger),
                  positioned outside the Link so it doesn't navigate. */}
              <div className="absolute top-2 right-2 z-10">
                <DeleteProjectDialog
                  projectId={project.id}
                  projectName={project.name}
                  triggerVariant="icon"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Create your first project"
          description="Add a website, install the snippet, and your analytics start flowing."
          action={<CreateProjectDialog triggerLabel="Create project" />}
        />
      )}
    </div>
  );
}
