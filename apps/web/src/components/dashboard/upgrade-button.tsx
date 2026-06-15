"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Button } from "@/components/ui/button";

const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const environment = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as
  | "sandbox"
  | "production";
const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO;

/**
 * Opens the Paddle overlay checkout for the Pro price. `user_id` is passed as
 * customData so the webhook can map the resulting subscription back to the user.
 */
export function UpgradeButton({
  userId,
  email,
  label = "Upgrade to Pro",
}: {
  userId: string;
  email: string;
  label?: string;
}) {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    if (!token) return;
    initializePaddle({ environment, token }).then((p) => {
      if (p) setPaddle(p);
    });
  }, []);

  if (!token || !priceId) {
    return (
      <p className="text-muted-foreground text-sm">
        Upgrades aren’t configured yet.
      </p>
    );
  }

  function openCheckout() {
    paddle?.Checkout.open({
      items: [{ priceId: priceId!, quantity: 1 }],
      customData: { user_id: userId },
      customer: { email },
      settings: {
        displayMode: "overlay",
        successUrl: `${window.location.origin}/dashboard/billing?upgraded=1`,
      },
    });
  }

  return (
    <Button onClick={openCheckout} disabled={!paddle}>
      {paddle ? label : "Loading…"}
    </Button>
  );
}
