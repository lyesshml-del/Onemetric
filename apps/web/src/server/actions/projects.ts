"use server";

import { randomBytes } from "crypto";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validation/project";
import { planLimits } from "@/lib/plans";
import { canCreateProject } from "@/server/queries/billing";
import { getOwnedProject } from "@/server/queries/projects";

export type ProjectFormState = { error?: string };

/** Generates a public tracking key, e.g. `om_3f9a…`. */
function generatePublicKey(): string {
  return `om_${randomBytes(16).toString("hex")}`;
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const { user } = await requireUser();

  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (!(await canCreateProject(user.id, user.plan))) {
    const limits = planLimits(user.plan);
    return {
      error: `Your ${limits.label} plan allows ${limits.maxProjects} project${
        limits.maxProjects === 1 ? "" : "s"
      }. Upgrade to add more.`,
    };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      domain: parsed.data.domain,
      publicKey: generatePublicKey(),
      ownerId: user.id,
    },
    select: { id: true },
  });

  redirect(`/dashboard/${project.id}`);
}

/**
 * Permanently delete a project the user owns, and everything attached to it.
 *
 * The `Project` relations are all `onDelete: Cascade` (sessions, events,
 * funnels + steps, integrations, revenue events, report subscriptions), so a
 * single delete removes every dependent row at the database level — referential
 * integrity is preserved and no orphans are left behind.
 *
 * Tenancy-scoped (only the owner can delete) and the typed name must match
 * exactly — a server-side guard mirroring the dialog's type-to-confirm, so a
 * crafted request can't skip the safety check.
 */
export async function deleteProject(formData: FormData): Promise<void> {
  const { user } = await requireUser();

  const projectId = String(formData.get("projectId") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "");
  if (!projectId) notFound();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  // Defense in depth: the UI disables the button until this matches, but never
  // trust the client — bail back to Settings without deleting on a mismatch.
  if (confirmName !== project.name) {
    redirect(`/dashboard/${project.id}/settings`);
  }

  await prisma.project.delete({ where: { id: project.id } });

  revalidatePath("/dashboard");
  redirect(`/dashboard?deleted=${encodeURIComponent(project.name)}`);
}

export type RenameProjectState = { ok?: boolean; error?: string };

/**
 * Rename a project the user owns — `Project.name` only, nothing else touched.
 *
 * Owner-scoped (tenancy); the name is trimmed and must be 1–60 characters.
 * Returns a friendly error instead of throwing so the Settings form can show it
 * inline. No schema/migration, no new project; analytics, routes, and the
 * delete flow (ONE-63) are unaffected.
 */
export async function renameProject(
  projectId: string,
  newName: string,
): Promise<RenameProjectState> {
  const { user } = await requireUser();

  const name = newName.trim();
  if (!projectId) return { error: "Something went wrong — please try again." };
  if (name.length === 0) return { error: "Project name can't be empty." };
  if (name.length > 60) {
    return { error: "Project name must be 60 characters or fewer." };
  }

  const project = await getOwnedProject(user.id, projectId);
  if (!project) return { error: "Project not found." };

  // No-op if unchanged (the form's Save button is disabled in this case anyway).
  if (name === project.name) return { ok: true };

  await prisma.project.update({
    where: { id: project.id },
    data: { name },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${project.id}`);
  revalidatePath(`/dashboard/${project.id}/settings`);

  return { ok: true };
}
