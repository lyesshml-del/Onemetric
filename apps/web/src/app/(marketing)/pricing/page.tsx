import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pricing — OneMetric",
  description:
    "Simple, affordable analytics pricing. Free for one site; Pro adds more projects, events and data retention.",
};

const free = PLAN_LIMITS.FREE;
const pro = PLAN_LIMITS.PRO;

const plans = [
  {
    name: free.label,
    price: free.priceLabel,
    cadence: "forever",
    cta: "Start free",
    highlight: false,
    features: [
      `${free.maxProjects} project`,
      `${formatNumber(free.monthlyEvents)} events / month`,
      `${free.retentionDays}-day data retention`,
      "Website analytics, events & funnels",
      "Cookieless, GDPR-friendly",
    ],
  },
  {
    name: pro.label,
    price: pro.priceLabel,
    cadence: "per month",
    cta: "Start free",
    highlight: true,
    features: [
      "7-day free trial",
      `${pro.maxProjects} projects`,
      `${formatNumber(pro.monthlyEvents)} events / month`,
      `${pro.retentionDays}-day data retention`,
      "Everything in Free",
      "PayPal revenue attribution",
      "Weekly email reports",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Simple, affordable pricing
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-lg">
          Start free, upgrade when you grow. Prices in USD; billing and taxes are
          handled by our payment provider.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.highlight
                ? "border-foreground/30 bg-card rounded-xl border-2 p-6"
                : "border-border bg-card rounded-xl border p-6"
            }
          >
            <h2 className="font-medium">{plan.name}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {plan.price}
              </span>
              <span className="text-muted-foreground text-sm">
                {plan.cadence}
              </span>
            </div>
            <Button asChild className="mt-6 w-full">
              <Link href="/signup">{plan.cta}</Link>
            </Button>
            <ul className="mt-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="text-foreground mt-0.5 size-4 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-10 text-center text-sm">
        Pro upgrade is available in-app from your billing page after signing up.
      </p>
    </main>
  );
}
