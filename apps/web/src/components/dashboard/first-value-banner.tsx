"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useOnboardingDismissed } from "@/lib/hooks/use-onboarding-dismissed";

/**
 * ONE-71 (Move #4 — Activation) — the first-value "aha" moment. Once a project
 * has received its first data, the Overview opens with a calm, professional
 * acknowledgement that setup worked: "It works · you're getting traffic · here's
 * why it matters." It does NOT repeat the next-step CTAs — the ONE-66
 * `OnboardingChecklist` (rendered just below, same activation window) owns those,
 * so the two are complementary, not duplicative.
 *
 * Calm by design — no animation, no toast, no confetti. Shown during the
 * activation window (`hasData && !fullyActivated`, where ONE-74 redefined
 * activation as first-pageview + a funnel *or* revenue), so it retires once the
 * project is engaged. ONE-74 also makes it dismissible: it honors the shared
 * per-project dismissal (the checklist owns the "Dismiss" control; this hides
 * with it). A thin client wrapper only to read that flag; otherwise purely
 * presentational, neutral + dark-first, using the emerald "live" semantic (not
 * the brand accent → no accent creep).
 */
export function FirstValueBanner({ projectId }: { projectId: string }) {
  const [dismissed] = useOnboardingDismissed(projectId);
  if (dismissed) return null;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          <p className="text-sm font-medium">Your analytics are live</p>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          It works — OneMetric is now tracking your site and collecting real
          visitor data, privately, with no cookies and no consent banner. Your
          live numbers are below and keep updating as people arrive.
        </p>
      </CardContent>
    </Card>
  );
}
