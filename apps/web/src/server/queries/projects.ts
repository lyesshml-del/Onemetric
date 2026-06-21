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
 * ONE-75 → ONE-81 (Move #5/#6) — stalled activations for the recovery cron:
 * projects **older than `olderThan`** that have **received zero events** (the
 * honest "installed-but-no-data" signal — `events: { none }`, real data only)
 * and have **not yet been nudged** (`recoveryEmailSentAt IS NULL`). The persistent
 * flag (ONE-81) replaces the fragile calendar-window bucket: the threshold can be
 * an open-ended cutoff (every still-stalled project, however old) with **no
 * double-send** (the flag) and **no missed cohorts** (a project missed on one run
 * is caught on the next, since it stays NULL). Returns the owner's email +
 * project basics so the cron can send a single calm setup reminder.
 */
export function getStalledProjectsForRecovery(olderThan: Date) {
  return prisma.project.findMany({
    where: {
      createdAt: { lte: olderThan },
      events: { none: {} },
      recoveryEmailSentAt: null,
    },
    select: {
      id: true,
      name: true,
      domain: true,
      owner: { select: { email: true } },
    },
  });
}

/**
 * ONE-81 — stamp a project as having received its recovery email, so it is never
 * emailed again (the at-most-once guarantee). Called only after a **successful**
 * send; a failed/no-op send leaves `recoveryEmailSentAt` NULL so the next cron
 * run retries.
 */
export function markRecoveryEmailSent(projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { recoveryEmailSentAt: new Date() },
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
