"use client";

import { useActionState, useState } from "react";
import { createFunnel, type FunnelFormState } from "@/server/actions/funnels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FunnelFormState = {};

type Step = { matchType: "PAGEVIEW_PATH" | "CUSTOM_EVENT"; matchValue: string };

const emptyStep = (): Step => ({ matchType: "PAGEVIEW_PATH", matchValue: "" });

export function CreateFunnelForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(
    createFunnel,
    initialState,
  );
  const [steps, setSteps] = useState<Step[]>([emptyStep(), emptyStep()]);

  const update = (i: number, patch: Partial<Step>) =>
    setSteps((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const add = () => setSteps((s) => [...s, emptyStep()]);
  const remove = (i: number) =>
    setSteps((s) => (s.length > 2 ? s.filter((_, idx) => idx !== i) : s));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-2">
        <Label htmlFor="name">Funnel name</Label>
        <Input id="name" name="name" placeholder="Signup flow" required />
      </div>

      <div className="space-y-2">
        <Label>Steps</Label>
        {steps.map((s, i) => (
          <div key={i} className="flex gap-2">
            <select
              name="stepType"
              value={s.matchType}
              onChange={(e) =>
                update(i, { matchType: e.target.value as Step["matchType"] })
              }
              aria-label={`Step ${i + 1} type`}
              className="border-input bg-background h-9 rounded-md border px-2 text-sm"
            >
              <option value="PAGEVIEW_PATH">Pageview path</option>
              <option value="CUSTOM_EVENT">Custom event</option>
            </select>
            <Input
              name="stepValue"
              value={s.matchValue}
              onChange={(e) => update(i, { matchValue: e.target.value })}
              placeholder={s.matchType === "PAGEVIEW_PATH" ? "/pricing" : "signup"}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => remove(i)}
              disabled={steps.length <= 2}
              aria-label={`Remove step ${i + 1}`}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add step
        </Button>
      </div>

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create funnel"}
      </Button>
    </form>
  );
}
