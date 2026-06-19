"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  "Add the snippet to your website.",
  "Visit your website once.",
  "Return here and your analytics will appear automatically.",
];

/**
 * ONE-65 — the Overview first-event onboarding (shown when a project has no
 * sessions/pageviews/events yet). Instruction over emptiness: what it is, the
 * tracking snippet to copy ("Snippet copied" toast), and three plain steps.
 * Neutral + dark-first; the copy button reuses the existing outline Button (no
 * accent). Replaces the old "waiting for your first pageview" placeholder.
 */
export function FirstEventOnboarding({
  snippet,
  settingsHref,
}: {
  snippet: string;
  settingsHref: string;
}) {
  const [toast, setToast] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setToast(true);
      window.setTimeout(() => setToast(false), 4000);
    } catch {
      // clipboard unavailable — the snippet is shown for manual copy
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
            Install OneMetric on your website and visit it once to start
            collecting analytics.
          </p>
          <div className="mx-auto mt-6 max-w-xl text-left">
            <pre className="bg-muted text-foreground overflow-x-auto rounded-md border p-4 text-sm">
              <code>{snippet}</code>
            </pre>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={copy}
            >
              Copy snippet
            </Button>
          </div>
          <Link
            href={settingsHref}
            className="text-muted-foreground hover:text-foreground mt-4 inline-block text-xs underline-offset-4 hover:underline"
          >
            Full setup &amp; verification →
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((text, i) => (
          <Card key={i}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs font-medium">
                Step {i + 1}
              </p>
              <p className="mt-1 text-sm">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-card text-card-foreground fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-md"
        >
          <Check className="size-4 text-emerald-500" aria-hidden />
          <span>Snippet copied</span>
        </div>
      ) : null}
    </div>
  );
}
