"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tab =
  | "overview"
  | "events"
  | "funnels"
  | "revenue"
  | "reports"
  | "settings";

/**
 * Move #2 / Phase B2 — the project section tabs with **optimistic** switching:
 * clicking a tab flips the active underline immediately (optimistic `pendingKey`)
 * and shows a subtle pending hint while the destination loads, instead of waiting
 * for the server round-trip.
 *
 * Keeps **native `<Link>`** navigation (prefetch, real hrefs, a11y, middle/⌘-click
 * — guarded so modifier-clicks don't falsely flip). The only client state is which
 * tab was clicked; it's cleared when the destination commits (the `active` prop
 * changes — which also covers browser back/forward), so the underline always
 * re-syncs with the URL. No `router.push` / `useTransition` / data library.
 *
 * Reduced-motion-safe (colour/opacity only; the global guard makes the transition
 * instant). The default (non-pending) render matches the old server nav except the
 * active tab UNDERLINE is now the accent (Move #3 / Phase B); the 6 project pages
 * that share `<ProjectHeader>` are otherwise unchanged.
 */
export function TabNav({ projectId, active }: { projectId: string; active: Tab }) {
  const tabs: { key: Tab; label: string; href: string }[] = [
    { key: "overview", label: "Overview", href: `/dashboard/${projectId}` },
    { key: "events", label: "Events", href: `/dashboard/${projectId}/events` },
    { key: "funnels", label: "Funnels", href: `/dashboard/${projectId}/funnels` },
    { key: "revenue", label: "Revenue", href: `/dashboard/${projectId}/revenue` },
    { key: "reports", label: "Reports", href: `/dashboard/${projectId}/reports` },
    { key: "settings", label: "Settings", href: `/dashboard/${projectId}/settings` },
  ];

  const [pendingKey, setPendingKey] = useState<Tab | null>(null);

  // Clear the optimistic state once the destination commits (active changes) —
  // including browser back/forward — so the underline re-syncs with the URL.
  useEffect(() => {
    setPendingKey(null);
  }, [active]);

  return (
    <nav className="border-border flex gap-4 border-b">
      {tabs.map((tab) => {
        const isActive = pendingKey ? pendingKey === tab.key : active === tab.key;
        const isPending = pendingKey === tab.key && active !== tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            // Optimistically flip on a plain left-click only; let modifier-clicks
            // (new tab/window) navigate without falsely flipping this page.
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              setPendingKey(tab.key);
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "border-b-2 px-1 pb-2 text-sm transition-colors duration-[var(--motion-micro)] ease-soft",
              // Move #3 / Phase B — the accent marks the active tab via the UNDERLINE
              // only (border-brand). The label stays text-foreground: text-brand would
              // be 4.00:1 on --background (fails AA 4.5 at 14px), and two accent signals
              // would overdo it — one active indicator per control.
              isActive
                ? "border-brand text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
              isPending && "opacity-70",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
