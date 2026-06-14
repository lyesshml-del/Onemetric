import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import {
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import type { WeeklyReport } from "./builder";

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

export function WeeklyReportEmail({ report }: { report: WeeklyReport }) {
  const { metrics } = report;
  const tiles: { label: string; value: string }[] = [
    { label: "Unique visitors", value: formatNumber(metrics.uniqueVisitors) },
    { label: "Sessions", value: formatNumber(metrics.sessions) },
    { label: "Pageviews", value: formatNumber(metrics.pageviews) },
    { label: "Avg. duration", value: formatDuration(metrics.avgDurationSec) },
    { label: "Bounce rate", value: formatPercent(metrics.bounceRate) },
  ];

  return (
    <Html>
      <Head />
      <Preview>{`Your weekly OneMetric report for ${report.projectName}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>OneMetric</Text>
          <Heading style={heading}>{report.projectName}</Heading>
          <Text style={subtle}>
            {report.domain} · {fmtDate(report.periodStart)} →{" "}
            {fmtDate(report.periodEnd)}
          </Text>

          <Section style={{ marginTop: 24 }}>
            {tiles.map((t) => (
              <Row key={t.label} style={metricRow}>
                <Column>
                  <Text style={metricLabel}>{t.label}</Text>
                </Column>
                <Column align="right">
                  <Text style={metricValue}>{t.value}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Heading as="h2" style={h2}>
            Top pages
          </Heading>
          {report.topPages.length === 0 ? (
            <Text style={subtle}>No pageviews this week.</Text>
          ) : (
            report.topPages.map((p) => (
              <Row key={p.label} style={metricRow}>
                <Column>
                  <Text style={metricLabel}>{p.label}</Text>
                </Column>
                <Column align="right">
                  <Text style={metricValue}>{formatNumber(p.value)}</Text>
                </Column>
              </Row>
            ))
          )}

          <Text style={footer}>Sent by OneMetric · weekly summary</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#0a0a0a", margin: 0, padding: "24px 0" };
const container = {
  backgroundColor: "#141414",
  borderRadius: 12,
  padding: 32,
  maxWidth: 480,
  margin: "0 auto",
  fontFamily: "Arial, Helvetica, sans-serif",
};
const brand = {
  color: "#a1a1aa",
  fontSize: 12,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  margin: 0,
};
const heading = { color: "#fafafa", fontSize: 24, margin: "8px 0 0" };
const subtle = { color: "#a1a1aa", fontSize: 13, margin: "4px 0 0" };
const h2 = { color: "#fafafa", fontSize: 16, margin: "28px 0 8px" };
const metricRow = { borderBottom: "1px solid #262626" };
const metricLabel = { color: "#d4d4d8", fontSize: 14, margin: "8px 0" };
const metricValue = {
  color: "#fafafa",
  fontSize: 14,
  fontWeight: 600 as const,
  margin: "8px 0",
};
const footer = { color: "#71717a", fontSize: 12, marginTop: 28 };
