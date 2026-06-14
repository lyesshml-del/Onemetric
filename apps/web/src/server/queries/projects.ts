import { prisma } from "@/lib/prisma";

/** All projects owned by a user (tenancy is scoped by `ownerId`). */
export function listProjects(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, domain: true, createdAt: true },
  });
}

/** A single project, only if owned by the given user (else null). */
export function getOwnedProject(ownerId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId },
  });
}

/** Lightweight ingestion stats used by the install-verification UI. */
export async function getProjectIngestStats(projectId: string) {
  const [events, lastEvent] = await Promise.all([
    prisma.event.count({ where: { projectId } }),
    prisma.event.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);
  return { events, lastEventAt: lastEvent?.createdAt ?? null };
}
