"use client";

import { useActionState } from "react";
import { addSubscription, type ReportFormState } from "@/server/actions/reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ReportFormState = {};

export function AddSubscriptionForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(
    addSubscription,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex gap-2">
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="flex-1"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>
      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}
    </form>
  );
}
