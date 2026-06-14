"use server";

import { requireUser } from "@/lib/auth";

export type BillingActionState = { error?: string; url?: string };

/**
 * Starts an upgrade checkout. Provider wiring (2Checkout / Paddle) is added in the
 * final billing step — until then this is a no-op seam so the UI can be built.
 *
 * TODO(Phase 9 final): create the MoR hosted-checkout session for the Pro price,
 * passing `user.id` as passthrough/custom data, and return its URL.
 */
export async function startCheckout(): Promise<BillingActionState> {
  await requireUser();
  return { error: "Self-serve upgrade isn't enabled yet — contact us to upgrade." };
}

/**
 * Returns the Merchant-of-Record's subscription-management URL.
 *
 * TODO(Phase 9 final): return the MoR-hosted management link for the user's
 * `billingCustomerId` / `billingSubscriptionId`.
 */
export async function manageBilling(): Promise<BillingActionState> {
  await requireUser();
  return { error: "Billing management isn't enabled yet." };
}
