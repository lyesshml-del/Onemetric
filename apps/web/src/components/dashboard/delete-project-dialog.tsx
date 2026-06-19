"use client";

import { useState } from "react";
import { deleteProject } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * ONE-63 — the Settings "Danger Zone" deletion flow.
 *
 * A destructive trigger opens a confirmation dialog that requires typing the
 * exact project name; the Delete button stays disabled until it matches. Submit
 * posts to the `deleteProject` server action (cascade delete → redirect to
 * /dashboard with a success flash). The server re-checks the name. Destructive
 * colours are confined to this deletion flow.
 */
export function DeleteProjectDialog({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const matches = confirm === projectName;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setConfirm(""); // re-open clean
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All events, funnels, revenue
            information and every piece of data associated with this project will
            be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <form action={deleteProject} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Type{" "}
              <span className="text-foreground font-medium">{projectName}</span>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-name"
              name="confirmName"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder={projectName}
              aria-label={`Type ${projectName} to confirm deletion`}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!matches}>
              Delete project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
