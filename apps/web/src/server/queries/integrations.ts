import { IntegrationProvider, IntegrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptJson } from "@/lib/crypto";
import type { PayPalCredentials } from "@/lib/validation/integration";

/** Connection status for the PayPal integration (no secrets returned). */
export async function getPayPalConnection(projectId: string): Promise<{
  connected: boolean;
  environment: "live" | "sandbox" | null;
}> {
  const credentials = await getPayPalCredentials(projectId);
  return {
    connected: credentials !== null,
    environment: credentials?.environment ?? null,
  };
}

/** Decrypted PayPal credentials, or null if not connected. Server-only. */
export async function getPayPalCredentials(
  projectId: string,
): Promise<PayPalCredentials | null> {
  const integration = await prisma.integration.findUnique({
    where: {
      projectId_provider: {
        projectId,
        provider: IntegrationProvider.PAYPAL,
      },
    },
    select: { status: true, credentials: true },
  });

  if (
    !integration ||
    integration.status !== IntegrationStatus.CONNECTED ||
    !integration.credentials
  ) {
    return null;
  }

  const stored = integration.credentials as { enc?: string };
  if (!stored.enc) return null;

  try {
    return decryptJson<PayPalCredentials>(stored.enc);
  } catch {
    return null;
  }
}
