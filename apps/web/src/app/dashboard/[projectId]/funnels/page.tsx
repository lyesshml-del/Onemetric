import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import { listFunnels } from "@/server/queries/funnels";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { CreateFunnelForm } from "@/components/dashboard/create-funnel-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Funnels — OneMetric",
};

export default async function FunnelsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const [projects, funnels] = await Promise.all([
    listProjects(user.id),
    listFunnels(project.id),
  ]);

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="funnels"
      />

      <h2 className="text-lg font-medium">Funnels</h2>

      {funnels.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {funnels.map((f) => (
            <li key={f.id}>
              <Link
                href={`/dashboard/${project.id}/funnels/${f.id}`}
                className="block"
              >
                <Card className="hover:border-foreground/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{f.name}</CardTitle>
                    <CardDescription>
                      {f._count.steps} step{f._count.steps === 1 ? "" : "s"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No funnels created"
          description="Create your first funnel to understand where users drop off."
          action={
            <a href="#new-funnel" className={buttonVariants()}>
              Create funnel
            </a>
          }
        />
      )}

      <Card id="new-funnel" className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">New funnel</CardTitle>
          <CardDescription>
            Define an ordered path. Each step is a pageview path (e.g.{" "}
            <code>/pricing</code>) or a custom event (e.g. <code>signup</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateFunnelForm projectId={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}
