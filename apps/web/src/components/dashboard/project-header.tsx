import Link from "next/link";
import { ProjectSwitcher } from "@/components/dashboard/project-switcher";
import { TabNav, type Tab } from "@/components/dashboard/tab-nav";

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

      {/* Move #2 / Phase B2 — section tabs with optimistic switching (client leaf). */}
      <TabNav projectId={projectId} active={active} />
    </div>
  );
}
