"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validation/project";
import { planLimits } from "@/lib/plans";
import { canCreateProject } from "@/server/queries/billing";

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
