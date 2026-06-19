"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

/**
 * ONE-63 — calm success toast after a project is deleted.
 *
 * The server action redirects to `/dashboard?deleted=<name>`; this reads the
 * name (passed as a prop by the page) and shows a transient confirmation, then
 * strips the query param via `history.replaceState` (no Next navigation, so the
 * freshly-revalidated project list stays in place) and auto-dismisses. Neutral
 * by design — destructive colours stay on the deletion action, not the success.
 */
export function DeletedToast({ name }: { name: string }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    window.history.replaceState(null, "", "/dashboard");
    const timer = setTimeout(() => setOpen(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-card text-card-foreground fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-md"
    >
      <Check className="size-4 text-emerald-500" aria-hidden />
      <span>
        Project <span className="font-medium">{name}</span> deleted.
      </span>
    </div>
  );
}
