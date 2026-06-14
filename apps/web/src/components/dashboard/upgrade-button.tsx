"use client";

import { useActionState, useEffect } from "react";
import {
  startCheckout,
  type BillingActionState,
} from "@/server/actions/billing";
import { Button } from "@/components/ui/button";

const initialState: BillingActionState = {};

export function UpgradeButton({ label = "Upgrade to Pro" }: { label?: string }) {
  const [state, formAction, pending] = useActionState(
    startCheckout,
    initialState,
  );

  // When the provider is wired, the action returns a hosted-checkout URL.
  useEffect(() => {
    if (state.url) window.location.href = state.url;
  }, [state.url]);

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" disabled={pending}>
        {pending ? "Starting…" : label}
      </Button>
      {state.error ? (
        <p className="text-muted-foreground text-sm">{state.error}</p>
      ) : null}
    </form>
  );
}
