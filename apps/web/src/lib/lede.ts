/**
 * Move #1 — the Overview "Lede": one calm, factual sentence answering
 * "what changed?" in plain English. Templated logic only — no AI, no LLM, no
 * external services.
 *
 * Phase 0 reserved the types. **Phase B** implements `buildLede` with the
 * traffic + top-source clauses; **Phase E** appends a funnel clause and
 * **Phase F** a revenue clause (the `funnel`/`revenue` inputs below stay unused
 * until then, so the sentence enriches itself automatically).
 */
import type { OverviewMetrics } from "@/server/queries/analytics";
import {
  computeDelta,
  formatDeltaPct,
  formatNumber,
  formatPercent,
} from "@/lib/format";

/** A single span of the Lede sentence. `href` makes it an inline drill link. */
export type LedeToken = {
  text: string;
  /** Render with stronger weight (the data nouns). */
  emphasis?: boolean;
  /** When set, the token is an inline link to its drill-in view. */
  href?: string;
};

/**
 * Inputs the Lede is built from. `topSource`/`funnel`/`revenue` are optional and
 * "light up" progressively as Phases B/E/F deliver their data. `href` is
 * optional because some drill targets don't exist yet (e.g. a Sources page).
 */
export type LedeInput = {
  current: OverviewMetrics;
  previous: OverviewMetrics;
  /** "this week" | "this month" | "this quarter", from the active range. */
  periodWord: string;
  projectId: string;
  topSource?: { label: string; href?: string } | null;
  funnel?: { name: string; conversion: number; href?: string } | null;
  revenue?: {
    topSource: string;
    amount: number;
    currency: string | null;
    href?: string;
  } | null;
};

/** Relative changes smaller than this read as "steady" (avoids noisy sub-0.5% deltas). */
const FLAT_THRESHOLD = 0.005;

/**
 * Builds the Lede sentence as an ordered list of tokens. Phase B is traffic-only
 * (visitors trend + optional top source). Every edge case stays grammatical:
 * increasing, decreasing, flat/tiny, no baseline, and zero traffic.
 */
export function buildLede(input: LedeInput): LedeToken[] {
  const { current, previous, periodWord, topSource, funnel } = input;
  const visitors = current.uniqueVisitors;

  // Zero traffic (defensive — the Lede normally only renders when data exists).
  if (visitors <= 0) {
    return [{ text: `No visitors recorded ${periodWord} yet.` }];
  }

  const visitorWord = visitors === 1 ? "visitor" : "visitors";
  const visitorsToken: LedeToken = {
    text: `${formatNumber(visitors)} ${visitorWord}`,
    emphasis: true,
  };

  // ", led by <source>" — emphasized; linked only when a drill target exists.
  const sourceTail: LedeToken[] = topSource
    ? [
        { text: ", led by " },
        {
          text: topSource.label,
          emphasis: true,
          ...(topSource.href ? { href: topSource.href } : {}),
        },
      ]
    : [];

  const { direction, pct } = computeDelta(visitors, previous.uniqueVisitors);

  // --- Traffic clause (Phase B). Byte-identical to before when no later clause. ---
  let tokens: LedeToken[];
  if (pct === null) {
    // No baseline period to compare against — state the current figure plainly.
    tokens = [visitorsToken, { text: ` ${periodWord}` }, ...sourceTail, { text: "." }];
  } else if (direction === "flat" || Math.abs(pct) < FLAT_THRESHOLD) {
    // Flat or a tiny change reads as "steady" (no noisy percentage).
    tokens = [
      { text: `Traffic is steady ${periodWord} — ` },
      visitorsToken,
      ...sourceTail,
      { text: "." },
    ];
  } else {
    // Increasing or decreasing — sign carried by the verb, magnitude by the %.
    tokens = [
      { text: `Traffic is ${pct > 0 ? "up" : "down"} ` },
      { text: formatDeltaPct(pct), emphasis: true },
      { text: ` ${periodWord} — ` },
      visitorsToken,
      ...sourceTail,
      { text: "." },
    ];
  }

  // --- Funnel clause (Phase E) — appended only when a primary funnel has data. ---
  if (funnel) {
    tokens.push(
      { text: ` ${funnel.name} converts at ` },
      {
        text: formatPercent(funnel.conversion),
        emphasis: true,
        ...(funnel.href ? { href: funnel.href } : {}),
      },
      { text: "." },
    );
  }

  // (Phase F will append a revenue clause here.)
  return tokens;
}
