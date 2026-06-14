"use server";

import { redirect } from "next/navigation";
import {
  IntegrationProvider,
  IntegrationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getOwnedProject } from "@/server/queries/projects";
import { connectPayPalSchema } from "@/lib/validation/integration";
import { encryptJson } from "@/lib/crypto";

export type IntegrationFormState = { error?: string };

export async function connectPayPal(
  _prevState: IntegrationFormState,
  formData: FormData,
): Promise<IntegrationFormState> {
  const { user } = await requireUser();

  const projectId = String(formData.get("projectId") ?? "");
  const project = await getOwnedProject(user.id, projectId);
  if (!project) return { error: "Project not found." };

  const parsed = connectPayPalSchema.safeParse({
    clientId: formData.get("clientId"),
    clientSecret: formData.get("clientSecret"),
    webhookId: formData.get("webhookId"),
    environment: formData.get("environment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const credentials = { enc: encryptJson(parsed.data) };

  await prisma.integration.upsert({
    where: {
      projectId_provider: {
        projectId,
        provider: IntegrationProvider.PAYPAL,
      },
    },
    update: { status: IntegrationStatus.CONNECTED, credentials },
    create: {
      projectId,
      provider: IntegrationProvider.PAYPAL,
      status: IntegrationStatus.CONNECTED,
      credentials,
    },
  });

  redirect(`/dashboard/${projectId}/revenue`);
}

export async function disconnectPayPal(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const project = await getOwnedProject(user.id, projectId);

  if (project) {
    await prisma.integration.updateMany({
      where: { projectId, provider: IntegrationProvider.PAYPAL },
      data: {
        status: IntegrationStatus.DISCONNECTED,
        credentials: Prisma.JsonNull,
      },
    });
  }

  redirect(`/dashboard/${projectId}/revenue`);
}
