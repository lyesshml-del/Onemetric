import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";

type Tab =
  | "overview"
  | "events"
  | "funnels"
  | "revenue"
  | "reports"
  | "settings";

export function ProjectHeader({
  projectId,
  projectName,
  domain,
  projects,
  active,
}: {
  projectId: string;
  projectName: string;
  domain: string;
  projects: { id: string; name: string }[];
  active: Tab;
}) {
  const tabs: { key: Tab; label: string; href: string }[] = [
    { key: "overview", label: "Overview", href: `/dashboard/${projectId}` },
    { key: "events", label: "Events", href: `/dashboard/${projectId}/events` },
    {
      key: "funnels",
      label: "Funnels",
      href: `/dashboard/${projectId}/funnels`,
    },
    {
      key: "revenue",
      label: "Revenue",
      href: `/dashboard/${projectId}/revenue`,
    },
    {
      key: "reports",
      label: "Reports",
      href: `/dashboard/${projectId}/reports`,
    },
    {
      key: "settings",
      label: "Settings",
      href: `/dashboard/${projectId}/settings`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {projectName}
          </h1>
          <p className="text-muted-foreground text-sm">{domain}</p>
        </div>
        {projects.length > 1 ? (
          <ProjectSwitcher projects={projects} currentId={projectId} />
        ) : null}
      </div>

      <nav className="border-border flex gap-4 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm transition-colors",
              tab.key === active
                ? "border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
