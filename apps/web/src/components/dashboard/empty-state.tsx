import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * ONE-65 — a calm, neutral empty state. One unified "nothing here yet" pattern
 * across the dashboard: a `rounded-xl bg-card border` card with a title, a
 * one-line description, and an optional action (a normal Button supplied by the
 * caller). Instruction over emptiness; no illustrations/images, no destructive
 * colours, no accent of its own. Server-safe.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        {icon ? <div className="text-muted-foreground mb-3">{icon}</div> : null}
        <p className="text-lg font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
