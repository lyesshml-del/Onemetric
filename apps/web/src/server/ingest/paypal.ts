import { IntegrationProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PayPalCredentials } from "@/lib/validation/integration";

const API_BASE: Record<PayPalCredentials["environment"], string> = {
  live: "https://api-m.paypal.com",
  sandbox: "https://api-m.sandbox.paypal.com",
};

export type PayPalSignatureHeaders = {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
};

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    amount?: { value?: string; currency_code?: string };
    create_time?: string;
    custom_id?: string | null;
  };
};

export type PayPalCapture = {
  externalId: string;
  amount: string;
  currency: string;
  occurredAt: Date;
  customId: string | null;
};

async function getAccessToken(c: PayPalCredentials): Promise<string | null> {
  const res = await fetch(`${API_BASE[c.environment]}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

/** Verifies a webhook's signature with PayPal's verify-webhook-signature API. */
export async function verifyPayPalSignature(
  c: PayPalCredentials,
  headers: PayPalSignatureHeaders,
  event: unknown,
): Promise<boolean> {
  const token = await getAccessToken(c);
  if (!token) return false;

  const res = await fetch(
    `${API_BASE[c.environment]}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.authAlgo,
        cert_url: headers.certUrl,
        transmission_id: headers.transmissionId,
        transmission_sig: headers.transmissionSig,
        transmission_time: headers.transmissionTime,
        webhook_id: c.webhookId,
        webhook_event: event,
      }),
    },
  );
  if (!res.ok) return false;
  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === "SUCCESS";
}

/** Extracts a completed capture from a webhook event, or null if not applicable. */
export function extractCapture(event: unknown): PayPalCapture | null {
  const e = event as PayPalWebhookEvent;
  if (e?.event_type !== "PAYMENT.CAPTURE.COMPLETED") return null;
  const r = e.resource;
  if (!r?.id || !r.amount?.value || !r.amount.currency_code) return null;
  return {
    externalId: r.id,
    amount: r.amount.value,
    currency: r.amount.currency_code,
    occurredAt: r.create_time ? new Date(r.create_time) : new Date(),
    customId: r.custom_id ?? null,
  };
}

/**
 * Parses a PayPal `custom_id` for attribution. Convention (set by the merchant
 * when creating the order): a URL-encoded string such as
 *   `utm_source=newsletter&utm_campaign=launch&om_session=<sessionId>`
 */
export function parseCustomId(customId: string | null): {
  utmSource: string | null;
  utmCampaign: string | null;
  sessionId: string | null;
} {
  if (!customId) return { utmSource: null, utmCampaign: null, sessionId: null };
  try {
    const p = new URLSearchParams(customId);
    return {
      utmSource: p.get("utm_source"),
      utmCampaign: p.get("utm_campaign"),
      sessionId: p.get("om_session"),
    };
  } catch {
    return { utmSource: null, utmCampaign: null, sessionId: null };
  }
}

/** Upserts a RevenueEvent, resolving attribution from custom_id / session. */
export async function recordRevenueEvent(
  projectId: string,
  capture: PayPalCapture,
): Promise<void> {
  const parsed = parseCustomId(capture.customId);
  let utmSource = parsed.utmSource;
  let utmCampaign = parsed.utmCampaign;
  let sessionId: string | null = null;

  if (parsed.sessionId) {
    const session = await prisma.session.findFirst({
      where: { id: parsed.sessionId, projectId },
      select: { id: true, utmSource: true, utmCampaign: true },
    });
    if (session) {
      sessionId = session.id;
      utmSource = utmSource ?? session.utmSource;
      utmCampaign = utmCampaign ?? session.utmCampaign;
    }
  }

  await prisma.revenueEvent.upsert({
    where: {
      projectId_externalId: { projectId, externalId: capture.externalId },
    },
    update: {
      amount: capture.amount,
      currency: capture.currency,
      occurredAt: capture.occurredAt,
      sessionId,
      utmSource,
      utmCampaign,
    },
    create: {
      projectId,
      provider: IntegrationProvider.PAYPAL,
      externalId: capture.externalId,
      amount: capture.amount,
      currency: capture.currency,
      occurredAt: capture.occurredAt,
      sessionId,
      utmSource,
      utmCampaign,
    },
  });
}
