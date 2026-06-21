import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type RecoveryEmailProps = {
  projectName: string;
  domain: string;
  settingsUrl: string;
};

/**
 * ONE-75 (Move #5 — Activation Loop) — a single, calm "we haven't seen any data
 * yet" reminder for a project created a couple of days ago with zero events.
 * Helpful, not salesy; privacy-first tone; reuses the weekly-email dark theme
 * (neutral grays only — no brand accent). The cron sends it at most once per
 * project, so the copy reassures we won't keep nudging.
 */
export function RecoveryEmail({
  projectName,
  domain,
  settingsUrl,
}: RecoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Finish setting up ${projectName} — we haven't seen any data yet`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>OneMetric</Text>
          <Heading style={heading}>Let&apos;s finish setting up {projectName}</Heading>
          <Text style={subtle}>{domain}</Text>

          <Section style={{ marginTop: 20 }}>
            <Text style={paragraph}>
              You created this project a couple of days ago, but OneMetric
              hasn&apos;t received any analytics from it yet. That usually just
              means the tracking snippet isn&apos;t installed — or your site
              hasn&apos;t been visited since.
            </Text>
            <Text style={paragraph}>To start seeing visitors:</Text>
            <Text style={step}>
              1. Add the OneMetric snippet to your site, just before
              &lt;/head&gt;.
            </Text>
            <Text style={step}>
              2. Open your site once to send the first pageview.
            </Text>
            <Text style={step}>
              3. Your dashboard updates on its own — no refresh needed.
            </Text>
            <Text style={paragraph}>
              No site to test on yet? You can send a test event from your
              dashboard and watch it work right away.
            </Text>
          </Section>

          <Section style={{ marginTop: 8 }}>
            <Link href={settingsUrl} style={button}>
              Finish setup →
            </Link>
          </Section>

          <Text style={footnote}>
            OneMetric is cookieless and privacy-first — no cookies, no consent
            banner. This is a one-time setup reminder; we won&apos;t send another.
          </Text>
          <Text style={footer}>Sent by OneMetric</Text>
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
const heading = { color: "#fafafa", fontSize: 22, margin: "8px 0 0" };
const subtle = { color: "#a1a1aa", fontSize: 13, margin: "4px 0 0" };
const paragraph = {
  color: "#d4d4d8",
  fontSize: 14,
  lineHeight: "22px",
  margin: "0 0 12px",
};
const step = {
  color: "#d4d4d8",
  fontSize: 14,
  lineHeight: "22px",
  margin: "0 0 6px",
};
const button = {
  display: "inline-block",
  backgroundColor: "#fafafa",
  color: "#0a0a0a",
  fontSize: 14,
  fontWeight: 600 as const,
  textDecoration: "none",
  borderRadius: 8,
  padding: "10px 18px",
};
const footnote = {
  color: "#a1a1aa",
  fontSize: 12,
  lineHeight: "18px",
  margin: "28px 0 0",
};
const footer = { color: "#71717a", fontSize: 12, marginTop: 12 };
