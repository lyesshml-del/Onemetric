import Link from "next/link";
import {
  BarChart3,
  MousePointerClick,
  Filter,
  DollarSign,
  Mail,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatNumber } from "@/lib/format";

const features = [
  {
    icon: BarChart3,
    title: "Website analytics",
    description:
      "Visitors, sessions, pageviews, bounce rate and session duration — with top pages, referrers, countries, devices and browsers.",
  },
  {
    icon: MousePointerClick,
    title: "Event tracking",
    description:
      "Track signups, logins, purchases, clicks and form submissions with a single onemetric.track() call.",
  },
  {
    icon: Filter,
    title: "Funnels",
    description:
      "Build multi-step funnels and see conversion rates and drop-offs between each step.",
  },
  {
    icon: DollarSign,
    title: "Revenue attribution",
    description:
      "Connect PayPal and see revenue by source and by campaign — tie marketing to money.",
  },
  {
    icon: Mail,
    title: "Weekly reports",
    description:
      "A clean, templated email summary every Monday. No AI, no noise — just your numbers.",
  },
  {
    icon: Zap,
    title: "1-minute install",
    description:
      "Drop one tiny script tag into your site and you're live. No SDKs, no build step.",
  },
];

export default function LandingPage() {
  const pro = PLAN_LIMITS.PRO;

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
        <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
          <ShieldCheck className="size-3.5" />
          Cookieless · no cookie banner · GDPR-friendly
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Simple, affordable analytics for founders.
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
          Website analytics, events, funnels and revenue attribution — in one
          place. Install in under a minute and watch the data flow in.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="bg-card p-6">
              <f.icon className="text-foreground size-5" />
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm text-pretty">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy angle */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Privacy-first by design
        </h2>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-pretty">
          OneMetric is cookieless and stores no personal data — visitors are
          counted with a daily-rotating hash, so there&apos;s no cross-day
          tracking and no cookie banner to slow your site down. Your data is
          processed in the EU.
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Add the snippet", body: "Paste one script tag into your site's <head>." },
            { step: "2", title: "See your data", body: "Pageviews, events and sessions appear instantly." },
            { step: "3", title: "Grow", body: "Build funnels, attribute revenue, get weekly reports." },
          ].map((s) => (
            <div key={s.step}>
              <div className="bg-muted text-foreground flex size-8 items-center justify-center rounded-full text-sm font-medium">
                {s.step}
              </div>
              <h3 className="mt-4 font-medium">{s.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Start free, upgrade when you grow
        </h2>
        <p className="text-muted-foreground mt-4">
          Free forever for one site. Pro adds more projects,{" "}
          {formatNumber(pro.monthlyEvents)} events/month and a year of data
          retention.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">Compare plans</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
