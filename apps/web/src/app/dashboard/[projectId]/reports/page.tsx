import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import { listSubscriptions } from "@/server/queries/reports";
import {
  removeSubscription,
  toggleSubscription,
  sendReportsNow,
} from "@/server/actions/reports";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { AddSubscriptionForm } from "@/components/dashboard/add-subscription-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reports — OneMetric",
};

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const [projects, subscriptions] = await Promise.all([
    listProjects(user.id),
    listSubscriptions(project.id),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="reports"
      />

      <div>
        <h2 className="text-lg font-medium">Weekly reports</h2>
        <p className="text-muted-foreground text-sm">
          A templated email summary is sent every Monday to enabled recipients.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipients</CardTitle>
          <CardDescription>Who receives the weekly summary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddSubscriptionForm projectId={project.id} />

          {subscriptions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recipients yet.</p>
          ) : (
            <ul className="divide-border divide-y">
              {subscriptions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{s.email}</p>
                    <p className="text-muted-foreground text-xs">
                      {s.enabled ? "Enabled" : "Disabled"}
                      {s.lastSentAt
                        ? ` · last sent ${s.lastSentAt.toISOString().slice(0, 10)}`
                        : " · never sent"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleSubscription}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button type="submit" variant="outline" size="sm">
                        {s.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={removeSubscription}>
                      <input type="hidden" name="id" value={s.id} />
                      <Button type="submit" variant="outline" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send now</CardTitle>
          <CardDescription>
            Send this week&apos;s report immediately to all enabled recipients.
            Requires email to be configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={sendReportsNow}>
            <input type="hidden" name="projectId" value={project.id} />
            <Button type="submit" variant="outline" size="sm">
              Send now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
