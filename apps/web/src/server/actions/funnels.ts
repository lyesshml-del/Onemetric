"use server";

import { redirect } from "next/navigation";
import { FunnelMatchType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getOwnedProject } from "@/server/queries/projects";
import { createFunnelSchema } from "@/lib/validation/funnel";

export type FunnelFormState = { error?: string };

export async function createFunnel(
  _prevState: FunnelFormState,
  formData: FormData,
): Promise<FunnelFormState> {
  const { user } = await requireUser();

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getOwnedProject(user.id, projectId);
  if (!project) return { error: "Project not found." };

  const types = formData.getAll("stepType").map(String);
  const values = formData.getAll("stepValue").map(String);
  const steps = types
    .map((matchType, i) => ({
      matchType,
      matchValue: (values[i] ?? "").trim(),
    }))
    .filter((s) => s.matchValue.length > 0);

  const parsed = createFunnelSchema.safeParse({
    name: formData.get("name"),
    steps,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const funnel = await prisma.funnel.create({
    data: {
      projectId,
      name: parsed.data.name,
      steps: {
        create: parsed.data.steps.map((s, i) => ({
          order: i,
          matchType: s.matchType as FunnelMatchType,
          matchValue: s.matchValue,
        })),
      },
    },
    select: { id: true },
  });

  redirect(`/dashboard/${projectId}/funnels/${funnel.id}`);
}

export async function deleteFunnel(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const funnelId = String(formData.get("funnelId") ?? "");
  const projectId = String(formData.get("projectId") ?? "");

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, project: { ownerId: user.id } },
    select: { id: true },
  });
  if (funnel) {
    await prisma.funnel.delete({ where: { id: funnel.id } });
  }

  redirect(`/dashboard/${projectId}/funnels`);
}
