import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/server/queries/projects";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { DeletedToast } from "@/components/dashboard/deleted-toast";
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Create a project, install the snippet, and your analytics start
          flowing.
        </p>
      </div>

      {projects.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={`/dashboard/${project.id}`} className="block">
                <Card className="hover:border-foreground/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <CardDescription>{project.domain}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Create your first project"
          description="Add a website, install the snippet, and your analytics start flowing."
          action={
            <a href="#new-project" className={buttonVariants()}>
              Create project
            </a>
          }
        />
      )}

      <Card id="new-project" className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">New project</CardTitle>
          <CardDescription>Add a website to start tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
