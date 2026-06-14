import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — OneMetric",
};

const LAST_UPDATED = "June 14, 2026";
const CONTACT = "support@onemetric.sbs";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-medium [&>p]:text-muted-foreground [&>p]:mt-3 [&>p]:text-sm [&>ul]:text-muted-foreground [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-sm [&>ul>li]:mt-1">
        <p>
          OneMetric (&quot;we&quot;, &quot;us&quot;) provides a privacy-first,
          cookieless website analytics platform. This policy explains what data
          we handle and how. For analytics data collected on our customers&apos;
          websites, our customers are the data controllers and we act as their
          data processor.
        </p>

        <h2>Data we collect</h2>
        <ul>
          <li>
            <strong>Account data:</strong> your email address, used to
            authenticate and contact you about your account.
          </li>
          <li>
            <strong>Analytics data</strong> collected via our tracking script on
            a customer&apos;s site: pageviews, custom events, referrer and UTM
            parameters, and derived device, browser and country. Country, device
            and browser are derived server-side from the IP address and
            user-agent and the raw IP is <strong>not stored</strong>.
          </li>
          <li>
            <strong>Cookieless visitor count:</strong> visitors are identified by
            a salted hash that rotates daily. It is not personally identifiable
            and cannot be used to track a person across days or across sites.
          </li>
        </ul>

        <h2>Cookies and the ePrivacy Directive</h2>
        <p>
          Our analytics set and read <strong>nothing</strong> on a visitor&apos;s
          device — no cookies and no persistent identifiers. Because storing or
          accessing information on a device is what triggers the consent
          requirement of the EU ePrivacy Directive (Article 5(3)), cookieless
          analytics like ours fall outside it, so sites using OneMetric generally
          do not need a cookie banner for analytics. (The proposed ePrivacy
          Regulation was withdrawn in 2025; cookie rules remain governed by the
          Directive as implemented in each member state.) The dashboard itself
          uses essential cookies only, to keep you signed in.
        </p>

        <h2>Where data is processed</h2>
        <p>
          Analytics data is hosted and processed in the European Union (Supabase,
          eu-central-1). We use the following sub-processors: Supabase (database,
          authentication, hosting), Vercel (application hosting), Resend (email
          delivery), and our payment provider for billing. PayPal is used only
          when a customer connects it for revenue attribution.
        </p>

        <h2>Applicable law &amp; international transfers</h2>
        <p>
          OneMetric is operated from Algeria and handles personal data in
          accordance with Algerian Law No. 18-07 on the protection of personal
          data (as amended). Personal data of website visitors in the EU is
          handled under the GDPR, with OneMetric acting as our customers&apos;
          processor. Where personal data is transferred across borders, we rely on
          appropriate legal safeguards.
        </p>

        <h2>Data retention</h2>
        <p>
          Analytics data is retained according to your plan. Account data is kept
          until you delete your account, after which it is removed.
        </p>

        <h2>Your rights</h2>
        <p>
          Subject to applicable law (including the GDPR), you may request access
          to, correction of, or deletion of your personal data. Contact us at{" "}
          {CONTACT} and we will respond within a reasonable time.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy; material changes will be reflected by the
          &quot;last updated&quot; date above.
        </p>

        <h2>Contact</h2>
        <p>Questions about this policy: {CONTACT}.</p>
      </div>
    </main>
  );
}
