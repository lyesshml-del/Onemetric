"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
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
        <CardDescription>
          Complete these steps to activate your analytics.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
