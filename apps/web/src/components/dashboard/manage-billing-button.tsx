"use client";

import { useActionState, useEffect } from "react";
import {
  manageBilling,
  type BillingActionState,
} from "@/server/actions/billing";
import { Button } from "@/components/ui/button";

const initialState: BillingActionState = {};

/** Opens Paddle's customer portal (update payment / cancel) for the current user. */
export function ManageBillingButton() {
  const [state, formAction, pending] = useActionState(
    manageBilling,
    initialState,
  );

  useEffect(() => {
    if (state.url) window.location.href = state.url;
  }, [state.url]);

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Opening…" : "Manage billing"}
      </Button>
      {state.error ? (
        <p className="text-muted-foreground text-sm">{state.error}</p>
      ) : null}
    </form>
  );
}
