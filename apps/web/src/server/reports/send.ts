import { Resend } from "resend";
import type { WeeklyReport } from "./builder";
import { WeeklyReportEmail } from "./weekly-email";
import { RecoveryEmail, type RecoveryEmailProps } from "./recovery-email";

/**
 * Sends one weekly report email via Resend. Returns false (no-op) when
 * RESEND_API_KEY is not configured, so callers can run safely without it.
 */
export async function sendWeeklyReport(
  to: string,
  report: WeeklyReport,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const from =
    process.env.REPORT_FROM_EMAIL ?? "OneMetric <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Your weekly OneMetric report — ${report.projectName}`,
    react: WeeklyReportEmail({ report }),
  });

  return !error;
}

/**
 * ONE-75 — sends one installed-but-no-data recovery email via Resend. Mirrors
 * `sendWeeklyReport`: returns false (no-op) when RESEND_API_KEY is unset, so the
 * cron runs safely without it.
 */
export async function sendRecoveryEmail(
  to: string,
  props: RecoveryEmailProps,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const from =
    process.env.REPORT_FROM_EMAIL ?? "OneMetric <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Finish setting up ${props.projectName} on OneMetric`,
    react: RecoveryEmail(props),
  });

  return !error;
}
