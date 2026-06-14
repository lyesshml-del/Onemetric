"use client";

import { useActionState } from "react";
import {
  connectPayPal,
  type IntegrationFormState,
} from "@/server/actions/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: IntegrationFormState = {};

export function ConnectPayPalForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(
    connectPayPal,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-2">
        <Label htmlFor="environment">Environment</Label>
        <select
          id="environment"
          name="environment"
          defaultValue="live"
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
        >
          <option value="live">Live</option>
          <option value="sandbox">Sandbox</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client ID</Label>
        <Input id="clientId" name="clientId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="clientSecret">Client secret</Label>
        <Input
          id="clientSecret"
          name="clientSecret"
          type="password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="webhookId">Webhook ID</Label>
        <Input id="webhookId" name="webhookId" required />
      </div>

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Connecting…" : "Connect PayPal"}
      </Button>
    </form>
  );
}
