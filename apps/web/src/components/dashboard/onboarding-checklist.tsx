"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboardingDismissed } from "@/lib/hooks/use-onboarding-dismissed";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * ONE-66 — activation checklist on the Overview (above the metric cards). Shows
 * progress toward activation; the page gates it on `!fullyActivated` (ONE-74:
 * first pageview + a funnel or revenue) and it also self-hides once every step
 * is complete or the user dismisses it. The step states are derived from real
 * data the Overview already fetches (no fake progress); it re-renders with fresh
 * data on navigation, so it updates without a manual refresh. ONE-77 adds a
 * calm "set up weekly reports" step (outline CTA) that promotes the existing
 * reports feature during onboarding. Neutral + dark-first; no new accent zone.
 * Client-only for the "Copy snippet" action + toast.
 *
 * ONE-82 — once the user is past the halfway mark (the 3 core steps are always
 * done when this renders, so this means at least one optional step too), the
 * checklist collapses to a calm progress summary (a progress bar + a one-line
 * summary + a "Show steps" toggle) to cut cognitive load; early-stage users (core
 * only) keep the full checklist. Same `steps` data drives both states (no
 * divergence, no fake progress); dismiss + reports + all CTAs are preserved.
 */
export function OnboardingChecklist({
  projectId,
  hasSession,
  hasFunnel,
  hasRevenue,
  hasReports,
  snippet,
  funnelsHref,
  revenueHref,
  reportsHref,
}: {
  projectId: string;
  hasSession: boolean;
  hasFunnel: boolean;
  hasRevenue: boolean;
  hasReports: boolean;
  snippet: string;
  funnelsHref: string;
  revenueHref: string;
  reportsHref: string;
}) {
  const [copied, setCopied] = useState(false);
  // ONE-82 — collapsed-summary expand toggle (only used past the halfway mark).
  const [expanded, setExpanded] = useState(false);
  // ONE-74 — let an established user dismiss the onboarding chrome for good
  // (shared per-project flag; also hides the FirstValueBanner above).
  const [dismissed, dismiss] = useOnboardingDismissed(projectId);

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      // clipboard unavailable — the snippet lives on Settings / the empty state
    }
  }

  const steps: { label: string; done: boolean; cta: ReactNode }[] = [
    { label: "Create project", done: true, cta: null },
    {
      label: "Install tracking script",
      done: true, // every project has a tracking key on creation
      cta: (
        <Button type="button" variant="outline" size="sm" onClick={copySnippet}>
          Copy snippet
        </Button>
      ),
    },
    { label: "Receive first pageview", done: hasSession, cta: null },
    {
      label: "Create first funnel",
      done: hasFunnel,
      cta: hasFunnel ? null : (
        <Button asChild size="sm">
          <Link href={funnelsHref}>Create funnel</Link>
        </Button>
      ),
    },
    {
      label: "Track first revenue event",
      done: hasRevenue,
      cta: hasRevenue ? null : (
        <Button asChild size="sm">
          <Link href={revenueHref}>View revenue docs</Link>
        </Button>
      ),
    },
    {
      // ONE-77 — promote the existing weekly-reports feature during onboarding
      // (a recurring reason to come back). Real signal: a recipient exists.
      label: "Set up weekly email reports",
      done: hasReports,
      cta: hasReports ? null : (
        <Button asChild variant="outline" size="sm">
          <Link href={reportsHref}>Set up reports</Link>
        </Button>
      ),
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  // Hide once fully activated (also guarded server-side) or if the user dismissed it.
  if (dismissed || completed === steps.length) return null;

  const currentIndex = steps.findIndex((s) => !s.done);
  const remaining = steps.length - completed;
  // ONE-82 — collapse to a summary past the halfway mark; the full list is one
  // click away. Early-stage users (core steps only) keep the full checklist.
  const collapsible = completed > steps.length / 2;
  const showSteps = !collapsible || expanded;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Getting started</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs tabular-nums">
              {completed} / {steps.length} completed
            </span>
            <button
              type="button"
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
        {collapsible ? (
          <div
            className="bg-muted mt-2 h-1 w-full overflow-hidden rounded-full"
            aria-hidden
          >
            <div
              className="bg-foreground/40 h-full rounded-full"
              style={{ width: `${(completed / steps.length) * 100}%` }}
            />
          </div>
        ) : null}
        <CardDescription>
          {collapsible
            ? `You've completed the essentials — ${remaining} optional step${
                remaining === 1 ? "" : "s"
              } left.`
            : "Complete these steps to activate your analytics."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {collapsible ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
          >
            {expanded ? (
              <ChevronUp className="size-3.5" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden />
            )}
            {expanded ? "Hide steps" : "Show steps"}
          </button>
        ) : null}
        {showSteps ? (
        <ol className="space-y-1">
          {steps.map((step, i) => {
            const isCurrent = i === currentIndex;
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-2 py-2",
                  isCurrent && "bg-muted/50",
                )}
              >
                <span className="flex items-center gap-2.5">
                  {step.done ? (
                    <Check className="size-4 shrink-0 text-emerald-500" aria-hidden />
                  ) : (
                    <Circle
                      className="text-muted-foreground/40 size-4 shrink-0"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      step.done
                        ? "text-foreground"
                        : isCurrent
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </span>
                {step.cta}
              </li>
            );
          })}
        </ol>
        ) : null}
      </CardContent>

      {copied ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-card text-card-foreground fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-md"
        >
          <Check className="size-4 text-emerald-500" aria-hidden />
          <span>Snippet copied</span>
        </div>
      ) : null}
    </Card>
  );
}
