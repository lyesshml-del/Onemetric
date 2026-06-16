/**
 * Move #1 / Phase 0 — type contract for the Overview "Lede" narrative.
 *
 * The shape is reserved here so later phases can plug clauses in without churn.
 * The builder itself is implemented in **Phase B** (traffic + top-source
 * clauses) and extended in **Phase E** (funnel) and **Phase F** (revenue).
 *
 * This file is intentionally types-only — no rendering and no logic in Phase 0.
 */
import type { OverviewMetrics } from "@/server/queries/analytics";

/** A single span of the Lede sentence. `href` makes it an inline drill link. */
export type LedeToken = {
  text: string;
  /** Render with stronger weight / the eventual accent (the data nouns). */
  emphasis?: boolean;
  /** When set, the token is an inline link to its drill-in view. */
  href?: string;
};

/**
 * Inputs the Lede is built from. `topSource`, `funnel`, and `revenue` are
 * optional and "light up" progressively as Phases D/E/F deliver their data.
 */
export type LedeInput = {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  /** "this week" | "this month" | "this quarter", from the active range. */
  periodWord: string;
  projectId: string;
  topSource?: { label: string; href: string } | null;
  funnel?: { name: string; conversion: number; href: string } | null;
  revenue?: {
    topSource: string;
    amount: number;
    currency: string | null;
    href: string;
  } | null;
};

// Phase B implements: export function buildLede(input: LedeInput): LedeToken[]
