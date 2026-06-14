"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getOwnedProject } from "@/server/queries/projects";
import { addSubscriptionSchema } from "@/lib/validation/report";
import { buildWeeklyReport } from "@/server/reports/builder";
import { sendWeeklyReport } from "@/server/reports/send";

export type ReportFormState = { error?: string };

function reportsPath(projectId: string) {
  return `/dashboard/${projectId}/reports`;
}

export async function addSubscription(
  _prevState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const { user } = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const project = await getOwnedProject(user.id, projectId);
  if (!project) return { error: "Project not found." };

  const parsed = addSubscriptionSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.reportSubscription.findFirst({
    where: { projectId, email: parsed.data.email },
    select: { id: true },
  });
  if (existing) return { error: "That email is already subscribed." };

  await prisma.reportSubscription.create({
    data: { projectId, email: parsed.data.email },
  });
  revalidatePath(reportsPath(projectId));
  return {};
}

/** Ownership-checked lookup of a subscription via its project. */
async function ownedSubscription(userId: string, id: string) {
  return prisma.reportSubscription.findFirst({
    where: { id, project: { ownerId: userId } },
    select: { id: true, enabled: true, projectId: true },
  });
}

export async function removeSubscription(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const sub = await ownedSubscription(user.id, id);
  if (sub) {
    await prisma.reportSubscription.delete({ where: { id: sub.id } });
    revalidatePath(reportsPath(sub.projectId));
  }
}

export async function toggleSubscription(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const sub = await ownedSubscription(user.id, id);
  if (sub) {
    await prisma.reportSubscription.update({
      where: { id: sub.id },
      data: { enabled: !sub.enabled },
    });
    revalidatePath(reportsPath(sub.projectId));
  }
}

/** Sends the weekly report now to all enabled recipients of a project. */
export async function sendReportsNow(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const project = await getOwnedProject(user.id, projectId);
  if (!project) return;

  const subs = await prisma.reportSubscription.findMany({
    where: { projectId, enabled: true },
    select: { id: true, email: true },
  });
  if (subs.length === 0) return;

  const report = await buildWeeklyReport({
    id: project.id,
    name: project.name,
    domain: project.domain,
  });

  for (const sub of subs) {
    const sent = await sendWeeklyReport(sub.email, report);
    if (sent) {
      await prisma.reportSubscription.update({
        where: { id: sub.id },
        data: { lastSentAt: new Date() },
      });
    }
  }

  revalidatePath(reportsPath(projectId));
}
