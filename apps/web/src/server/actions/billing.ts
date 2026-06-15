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
  const result = await createPortalSession(user.billingCustomerId);
  if (!result.url) {
    // Reason is logged server-side in createPortalSession; keep the UI generic.
    console.error("[billing] manageBilling failed:", result.error);
    return { error: "Couldn’t open the billing portal. Please try again." };
  }
  return { url: result.url };
}
