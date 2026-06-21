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

/**
 * ONE-75 (Move #5) — stalled activations for the recovery cron: projects
 * created within the given window that have **received zero events** (the
 * honest "installed-but-no-data" signal — `events: { none }`, real data only).
 * Returns the owner's email + project basics so the cron can email a single
 * calm setup reminder. The window is the cron's once-per-project day bucket, so
 * no "already nudged" flag/column is needed.
 */
export function getStalledProjectsForRecovery(from: Date, to: Date) {
  return prisma.project.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      events: { none: {} },
    },
    select: {
      id: true,
      name: true,
      domain: true,
      owner: { select: { email: true } },
    },
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
