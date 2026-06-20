import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";

/**
 * ONE-68 (Move #4 — Activation) — the first-run welcome shown on the dashboard
 * entry when the user has no projects yet. Turns the bare empty state into a
 * guided welcome: the primary "Create your first project" CTA (reuses the
 * ONE-67 `CreateProjectDialog` + the ONE-65 `EmptyState`) plus a calm preview
 * of the three steps ahead, mirroring the Overview `FirstEventOnboarding`
 * step-card language so the whole first run reads as one system. Server
 * component, purely presentational; neutral + dark-first; no accent of its own
 * (the create CTA is the existing sanctioned primary-button zone).
 */
const STEPS = [
  {
    title: "Create a project",
    body: "Add your website — it only takes a few seconds.",
  },
  {
    title: "Install the snippet",
    body: "Drop one lightweight script into your site's <head>.",
  },
  {
    title: "Watch analytics flow",
    body: "Visit your site once and your dashboard comes alive.",
  },
];

export function WelcomeProjects() {
  return (
    <div className="space-y-6">
      <EmptyState
        title="Create your first project"
        description="Add a website, install the snippet, and your analytics start flowing — cookieless, no banner, no PII."
        action={<CreateProjectDialog triggerLabel="Create project" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <Card key={step.title}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs font-medium tabular-nums">
                Step {i + 1}
              </p>
              <p className="mt-1 text-sm font-medium">{step.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
