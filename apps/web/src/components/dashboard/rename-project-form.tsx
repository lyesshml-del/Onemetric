"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { renameProject } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ONE-64 — the Settings "General" rename form.
 *
 * Controlled name input + Save button. Save is disabled while saving, when the
 * trimmed value is empty, or when it equals the last saved name. Calls the
 * `renameProject` server action via a transition (no navigation, no refresh);
 * the action revalidates the affected routes so the project header/list update
 * in place. Calm neutral success toast; friendly inline errors. The default
 * (primary) Button is the sanctioned primary-action accent — no other accent.
 */
export function RenameProjectForm({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [name, setName] = useState(projectName);
  const [savedName, setSavedName] = useState(projectName);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [pending, startTransition] = useTransition();

  const trimmed = name.trim();
  const disabled = pending || trimmed.length === 0 || trimmed === savedName;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setError(null);
    startTransition(async () => {
      const result = await renameProject(projectId, trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedName(trimmed);
      setName(trimmed);
      setToast(true);
      window.setTimeout(() => setToast(false), 4000);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" disabled={disabled}>
        {pending ? "Saving…" : "Save changes"}
      </Button>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-card text-card-foreground fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-md"
        >
          <Check className="size-4 text-emerald-500" aria-hidden />
          <span>Project renamed.</span>
        </div>
      ) : null}
    </form>
  );
}
