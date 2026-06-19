import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/server/queries/projects";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";
import { DeletedToast } from "@/components/dashboard/deleted-toast";
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
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      )}

      <Card className="max-w-md">
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
