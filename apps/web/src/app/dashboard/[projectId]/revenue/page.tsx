import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedProject, listProjects } from "@/server/queries/projects";
import { getPayPalConnection } from "@/server/queries/integrations";
import { disconnectPayPal } from "@/server/actions/integrations";
import {
  getRevenueSummary,
  getRevenueBySource,
  getRevenueByCampaign,
  getRecentRevenue,
} from "@/server/queries/revenue";
import { resolveRange } from "@/lib/range";
import { formatMoney, formatNumber } from "@/lib/format";
import { ProjectHeader } from "@/components/dashboard/project-header";
import { RangeSelect } from "@/components/dashboard/range-select";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BreakdownCard } from "@/components/dashboard/breakdown-card";
import { ConnectPayPalForm } from "@/components/dashboard/connect-paypal-form";
import { InstallSnippet } from "@/components/dashboard/install-snippet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Revenue — OneMetric",
};

export default async function RevenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { projectId } = await params;
  const { range: rangeParam } = await searchParams;
  const { user } = await requireUser();

  const project = await getOwnedProject(user.id, projectId);
  if (!project) notFound();

  const [projects, connection] = await Promise.all([
    listProjects(user.id),
    getPayPalConnection(project.id),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const webhookUrl = `${appUrl}/api/webhooks/paypal/${project.id}`;
  const { key: range, from, to } = resolveRange(rangeParam);

  return (
    <div className="space-y-8">
      <ProjectHeader
        projectId={project.id}
        projectName={project.name}
        domain={project.domain}
        projects={projects}
        active="revenue"
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Revenue</h2>
        {connection.connected ? <RangeSelect value={range} /> : null}
      </div>

      {!connection.connected ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connect PayPal</CardTitle>
              <CardDescription>
                Enter your PayPal REST app credentials. They are stored encrypted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectPayPalForm projectId={project.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook setup</CardTitle>
              <CardDescription>
                In PayPal, add this webhook URL and subscribe to{" "}
                <code>PAYMENT.CAPTURE.COMPLETED</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InstallSnippet snippet={webhookUrl} />
              <AttributionDoc />
            </CardContent>
          </Card>
        </div>
      ) : (
        <ConnectedRevenue
          projectId={project.id}
          environment={connection.environment}
          from={from}
          to={to}
          webhookUrl={webhookUrl}
        />
      )}
    </div>
  );
}

async function ConnectedRevenue({
  projectId,
  environment,
  from,
  to,
  webhookUrl,
}: {
  projectId: string;
  environment: "live" | "sandbox" | null;
  from: Date;
  to: Date;
  webhookUrl: string;
}) {
  const [summary, bySource, byCampaign, recent] = await Promise.all([
    getRevenueSummary(projectId, from, to),
    getRevenueBySource(projectId, from, to),
    getRevenueByCampaign(projectId, from, to),
    getRecentRevenue(projectId, from, to),
  ]);

  const money = (n: number) => formatMoney(n, summary.currency);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard label="Total revenue" value={money(summary.total)} />
        <MetricCard label="Payments" value={formatNumber(summary.count)} />
        <MetricCard
          label="PayPal"
          value="Connected"
          hint={environment ?? undefined}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BreakdownCard
          title="Revenue by source"
          items={bySource}
          format={money}
          emptyLabel="No revenue yet"
        />
        <BreakdownCard
          title="Revenue by campaign"
          items={byCampaign}
          format={money}
          emptyLabel="No revenue yet"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="text-muted-foreground px-4 pb-4 text-sm">
              No payments in this period.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date (UTC)</th>
                  <th className="px-4 py-3 text-left font-medium">Source</th>
                  <th className="px-4 py-3 text-left font-medium">Campaign</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="text-muted-foreground px-4 py-3 whitespace-nowrap tabular-nums">
                      {p.occurredAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">{p.utmSource ?? "—"}</td>
                    <td className="px-4 py-3">{p.utmCampaign ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatMoney(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook & attribution</CardTitle>
          <CardDescription>
            Webhook URL (subscribe to <code>PAYMENT.CAPTURE.COMPLETED</code>):
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InstallSnippet snippet={webhookUrl} />
          <AttributionDoc />
          <form action={disconnectPayPal}>
            <input type="hidden" name="projectId" value={projectId} />
            <Button type="submit" variant="outline" size="sm">
              Disconnect PayPal
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AttributionDoc() {
  return (
    <p className="text-muted-foreground text-sm">
      To attribute revenue, set the PayPal order&apos;s <code>custom_id</code> to
      a URL-encoded string like{" "}
      <code>utm_source=newsletter&amp;utm_campaign=launch</code> (you may also
      pass <code>om_session=&lt;sessionId&gt;</code>).
    </p>
  );
}
