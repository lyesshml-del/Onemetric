"use server";

import { requireUser } from "@/lib/auth";
import { createPortalSession } from "@/server/ingest/paddle";

export type BillingActionState = { error?: string; url?: string };

/**
 * Returns Paddle's customer-portal URL for the current user, where they can update
 * payment details or cancel. Checkout itself runs client-side via Paddle.js (see
 * `UpgradeButton`), so there is no server-side checkout action.
 */
export async function manageBilling(): Promise<BillingActionState> {
  const { user } = await requireUser();
  if (!user.billingCustomerId) {
    return { error: "No active subscription to manage yet." };
  }
  const url = await createPortalSession(user.billingCustomerId);
  if (!url) {
    return { error: "Couldn’t open the billing portal. Please try again." };
  }
  return { url };
}
