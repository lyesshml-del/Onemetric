import type { Metadata } from "next";
import Link from "next/link";
import { Plan } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { getBillingOverview } from "@/server/queries/billing";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatNumber } from "@/lib/format";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Billing — OneMetric",
};

export default async function BillingPage() {
  const { user } = await requireUser();
  const overview = await getBillingOverview(user.id, user.plan);
  const { limits } = overview;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          You are on the{" "}
          <span className="text-foreground font-medium">{limits.label}</span>{" "}
          plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage this month</CardTitle>
          <CardDescription>
            Limits for the {limits.label} plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageRow
            label="Projects"
            used={overview.projects}
            limit={limits.maxProjects}
          />
          <UsageRow
            label="Events"
            used={overview.eventsThisMonth}
            limit={limits.monthlyEvents}
          />
          <p className="text-muted-foreground text-sm">
            Data retention: {limits.retentionDays} days.
          </p>
        </CardContent>
      </Card>

      {user.plan === Plan.FREE ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Upgrade to {PLAN_LIMITS.PRO.label}
            </CardTitle>
            <CardDescription>
              {PLAN_LIMITS.PRO.maxProjects} projects,{" "}
              {formatNumber(PLAN_LIMITS.PRO.monthlyEvents)} events/mo,{" "}
              {PLAN_LIMITS.PRO.retentionDays}-day retention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpgradeButton />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manage subscription</CardTitle>
            <CardDescription>
              {user.subscriptionStatus ? `Status: ${user.subscriptionStatus}` : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Manage payment and cancellation from your billing provider (link
              coming soon).
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-muted-foreground text-sm">
        Compare plans on the{" "}
        <Link href="/pricing" className="text-foreground underline">
          pricing page
        </Link>
        .
      </p>
    </div>
  );
}

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {formatNumber(used)} / {formatNumber(limit)}
        </span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div className="bg-foreground/70 h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
