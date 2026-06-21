import { InstallGuide } from "@/components/dashboard/install-guide";
import { FirstEventGuide } from "@/components/dashboard/first-event-guide";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * ONE-76 (Move #5 — Activation Loop) — the one canonical setup surface: the
 * **Install** card (`InstallGuide`, ONE-69 — snippet + placement + per-stack
 * hints) followed by the **Verification** card (`FirstEventGuide`, ONE-70 with
 * ONE-72 auto-verify + ONE-73 send-a-test-event). Rendered identically on the
 * Settings page and on the Overview empty state, so a new user gets the full
 * install + verification right where they land — no Overview → Settings hop, and
 * no duplicated snippet variant. Server component; pure composition of the
 * existing canonical pieces; neutral + dark-first; no accent of its own.
 *
 * `showDashboardLink` is forwarded to `FirstEventGuide` — false on the Overview
 * (the "your dashboard" link would point at the current page).
 */
export function SetupGuide({
  snippet,
  publicKey,
  events,
  lastEventAt,
  overviewHref,
  showDashboardLink = true,
}: {
  snippet: string;
  publicKey: string;
  events: number;
  lastEventAt: Date | null;
  overviewHref: string;
  showDashboardLink?: boolean;
}) {
  const receiving = events > 0;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Install</CardTitle>
          <CardDescription>
            Add OneMetric to your site to start collecting analytics — it takes
            less than a minute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstallGuide snippet={snippet} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification</CardTitle>
          <CardDescription>
            {receiving
              ? "OneMetric is receiving data from your site."
              : "Let's get your first event flowing."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FirstEventGuide
            events={events}
            lastEventAt={lastEventAt}
            overviewHref={overviewHref}
            publicKey={publicKey}
            showDashboardLink={showDashboardLink}
          />
        </CardContent>
      </Card>
    </div>
  );
}
