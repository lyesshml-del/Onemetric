"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
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
 * progress toward activation and hides once all five steps are complete. The
 * step states are derived from real data the Overview already fetches (no new
 * queries, no fake progress); it re-renders with fresh data on navigation, so
 * it updates without a manual refresh. Neutral + dark-first; the primary CTAs
 * use the default Button styling (no new accent zone). Client-only for the
 * "Copy snippet" action + toast.
 */
export function OnboardingChecklist({
  hasSession,
  hasFunnel,
  hasRevenue,
  snippet,
  funnelsHref,
  revenueHref,
}: {
  hasSession: boolean;
  hasFunnel: boolean;
  hasRevenue: boolean;
  snippet: string;
  funnelsHref: string;
  revenueHref: string;
}) {
  const [copied, setCopied] = useState(false);

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
  ];

  const completed = steps.filter((s) => s.done).length;
  // Hide entirely once fully activated (also guarded server-side).
  if (completed === steps.length) return null;

  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Getting started</CardTitle>
          <span className="text-muted-foreground text-xs tabular-nums">
            {completed} / {steps.length} completed
          </span>
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
