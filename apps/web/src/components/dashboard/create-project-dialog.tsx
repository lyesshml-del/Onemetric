"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateProjectForm } from "@/components/dashboard/create-project-form";

/**
 * ONE-67 — create a project from a dialog (replaces the always-visible inline
 * form on the Projects page). Reuses the ONE-63 `Dialog` + the existing
 * `CreateProjectForm` (validation + the `createProject` server action, which
 * redirects to the new project on success → the dialog closes with the
 * navigation). The trigger is the default (primary) Button — no new accent zone.
 */
export function CreateProjectDialog({
  triggerLabel = "New project",
}: {
  triggerLabel?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Add a website to start tracking.</DialogDescription>
        </DialogHeader>
        <CreateProjectForm />
      </DialogContent>
    </Dialog>
  );
}
