import crypto from "node:crypto";
import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Paddle Billing integration (OneMetric's own subscription billing).
 *
 * Paddle is the Merchant-of-Record: checkout runs client-side via Paddle.js, and
 * subscription state is delivered here through signed webhooks. This module verifies
 * the signature, maps a subscription event onto `User`, and opens the customer portal.
 */

/** sandbox vs production drives the API host; client token/env are NEXT_PUBLIC. */
const PADDLE_API_BASE =
  (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

/**
 * Verifies a Paddle webhook signature.
 *
 * The `Paddle-Signature` header looks like `ts=1700000000;h1=<hex>`, where the hmac
 * is SHA-256 over `"<ts>:<rawBody>"` keyed with the destination's secret. The raw
 * request body must be passed unparsed.
 */
export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(";")) {
    const idx = segment.indexOf("=");
    if (idx === -1) continue;
    parts[segment.slice(0, idx).trim()] = segment.slice(idx + 1).trim();
  }

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(h1, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Maps a Paddle subscription status to a OneMetric plan. Access is granted during
 * the trial, while active, and through dunning (`past_due`) as a grace period;
 * `paused`/`canceled` (and anything else) drop to FREE.
 */
export function planForStatus(status: string | undefined): Plan {
  if (status === "active" || status === "trialing" || status === "past_due") {
    return Plan.PRO;
  }
  return Plan.FREE;
}

type PaddleSubscriptionData = {
  id?: string;
  status?: string;
  customer_id?: string;
  custom_data?: { user_id?: string } | null;
  current_billing_period?: { ends_at?: string | null } | null;
};

export type PaddleEvent = {
  event_type?: string;
  data?: PaddleSubscriptionData;
};

/**
 * Applies a Paddle subscription webhook to the matching `User`. Subscription events
 * carry the `user_id` we attached as `custom_data` at checkout; we fall back to the
 * Paddle `customer_id` for users already linked. Non-subscription events are ignored.
 */
export async function handlePaddleEvent(event: PaddleEvent): Promise<void> {
  const type = event.event_type ?? "";
  if (!type.startsWith("subscription.")) return;

  const data = event.data ?? {};
  const userId = data.custom_data?.user_id;
  const customerId = data.customer_id;

  const fields = {
    plan: planForStatus(data.status),
    subscriptionStatus: data.status ?? null,
    currentPeriodEnd: data.current_billing_period?.ends_at
      ? new Date(data.current_billing_period.ends_at)
      : null,
    ...(customerId ? { billingCustomerId: customerId } : {}),
    ...(data.id ? { billingSubscriptionId: data.id } : {}),
  };

  if (userId) {
    // Update by our own user id (carried via custom_data). Ignore if the user was
    // since deleted (P2025) — nothing to sync.
    await prisma.user
      .update({ where: { id: userId }, data: fields })
      .catch((err: unknown) => {
        if ((err as { code?: string })?.code === "P2025") return;
        throw err;
      });
    return;
  }

  if (customerId) {
    await prisma.user.updateMany({
      where: { billingCustomerId: customerId },
      data: fields,
    });
  }
}

/**
 * Creates a Paddle customer-portal session and returns its overview URL, or null
 * when billing isn't configured or the call fails. Server-only (uses the API key).
 */
export async function createPortalSession(
  customerId: string,
): Promise<string | null> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    console.error("[paddle] PADDLE_API_KEY is not set");
    return null;
  }

  try {
    const res = await fetch(
      `${PADDLE_API_BASE}/customers/${customerId}/portal-sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );
    if (!res.ok) {
      console.error(
        `[paddle] portal-session failed (${res.status}):`,
        await res.text().catch(() => ""),
      );
      return null;
    }
    const json = (await res.json()) as {
      data?: { urls?: { general?: { overview?: string } } };
    };
    const url = json.data?.urls?.general?.overview ?? null;
    if (!url) console.error("[paddle] portal-session: no overview url in response");
    return url;
  } catch (err) {
    console.error("[paddle] portal-session error", err);
    return null;
  }
}
