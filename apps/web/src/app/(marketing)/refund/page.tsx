import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — OneMetric",
};

const LAST_UPDATED = "June 14, 2026";
const CONTACT = "support@onemetric.sbs";

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Refund Policy</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-medium [&>p]:text-muted-foreground [&>p]:mt-3 [&>p]:text-sm [&>ul]:text-muted-foreground [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-sm [&>ul>li]:mt-1">
        <p>
          This policy explains how refunds work for paid OneMetric subscriptions.
          It applies alongside our Terms of Service.
        </p>

        <h2>Who you are billed by</h2>
        <p>
          Paid plans are sold and billed by our payment provider acting as the
          merchant of record. They process your payment, issue your invoice and
          handle applicable taxes. Refunds are issued back to your original
          payment method through the same provider.
        </p>

        <h2>14-day money-back guarantee</h2>
        <p>
          If you are not satisfied with a paid OneMetric plan, you may request a
          full refund within <strong>14 days</strong> of your initial purchase.
          Just contact us within that window and we will refund the payment — no
          complicated conditions.
        </p>

        <h2>Renewals</h2>
        <p>
          Subscriptions renew automatically until cancelled. You can cancel at any
          time from your billing page and you will keep access until the end of the
          period you have already paid for. We do not provide prorated refunds for
          the unused part of a billing period after the 14-day window, except where
          required by law.
        </p>

        <h2>How to request a refund</h2>
        <p>
          Email us at {CONTACT} from the address on your account, mentioning the
          plan and the approximate purchase date. We aim to respond within a few
          business days, and approved refunds are typically processed back to your
          original payment method within 5–10 business days, depending on your
          bank or card issuer.
        </p>

        <h2>Your statutory rights</h2>
        <p>
          Nothing in this policy limits any mandatory consumer-protection or
          statutory cancellation rights you may have under the law of your country
          of residence. Where those rights are more generous than this policy, they
          apply.
        </p>

        <h2>Contact</h2>
        <p>Questions about refunds or billing: {CONTACT}.</p>
      </div>
    </main>
  );
}
