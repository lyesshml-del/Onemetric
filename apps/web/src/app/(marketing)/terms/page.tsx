import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — OneMetric",
};

const LAST_UPDATED = "June 14, 2026";
const CONTACT = "support@onemetric.sbs";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Terms of Service
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-medium [&>p]:text-muted-foreground [&>p]:mt-3 [&>p]:text-sm [&>ul]:text-muted-foreground [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-sm [&>ul>li]:mt-1">
        <p>
          These terms govern your use of OneMetric. By creating an account or
          using the service, you agree to them.
        </p>

        <h2>The service</h2>
        <p>
          OneMetric is a cookieless analytics platform offering website
          analytics, event tracking, funnels, revenue attribution and weekly
          reports. We may add, change or remove features over time.
        </p>

        <h2>Your account</h2>
        <p>
          You are responsible for your account, the accuracy of your details and
          keeping your credentials secure. You must be able to form a binding
          contract to use the service.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Do not use the service for unlawful purposes or to violate others&apos; rights.</li>
          <li>
            Do not use OneMetric to collect personal or sensitive data about
            visitors, and comply with applicable privacy laws on your own sites
            (including posting your own privacy policy where required).
          </li>
          <li>Do not attempt to disrupt, overload or reverse-engineer the service.</li>
        </ul>

        <h2>Billing</h2>
        <p>
          Paid plans are billed through our third-party payment provider (a
          merchant of record), which handles payment processing, invoicing and
          applicable taxes. Subscriptions renew until cancelled; you can cancel
          at any time and retain access until the end of the paid period. Refunds
          are governed by our Refund Policy (a 14-day money-back guarantee on
          initial purchases).
        </p>

        <h2>Your data</h2>
        <p>
          You own the analytics data you collect through OneMetric. You grant us
          the rights needed to host and process it to provide the service. Our
          handling of personal data is described in the Privacy Policy.
        </p>

        <h2>Availability &amp; warranties</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any
          kind. We do not guarantee uninterrupted or error-free operation,
          particularly on free plans.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, OneMetric will not be liable for
          indirect, incidental or consequential damages, and our total liability
          is limited to the amount you paid in the preceding twelve months.
        </p>

        <h2>Termination</h2>
        <p>
          You may stop using the service at any time. We may suspend or terminate
          accounts that violate these terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of Algeria, where OneMetric is
          operated, without prejudice to mandatory consumer-protection or
          data-protection rights you may have in your country of residence.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms; material changes will be reflected by the
          &quot;last updated&quot; date above. Continued use constitutes
          acceptance.
        </p>

        <h2>Contact</h2>
        <p>Questions about these terms: {CONTACT}.</p>
      </div>
    </main>
  );
}
