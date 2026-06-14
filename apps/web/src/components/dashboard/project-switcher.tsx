"use client";

import { useRouter } from "next/navigation";

export function ProjectSwitcher({
  projects,
  currentId,
}: {
  projects: { id: string; name: string }[];
  currentId: string;
}) {
  const router = useRouter();

  return (
    <select
      value={currentId}
      onChange={(e) => router.push(`/dashboard/${e.target.value}`)}
      aria-label="Switch project"
      className="border-input bg-background h-9 rounded-md border px-3 text-sm"
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
