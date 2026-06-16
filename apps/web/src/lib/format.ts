/** Compact number formatting: 1234 → "1.2k", 1_500_000 → "1.5M". */
export function formatNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${trim(n / 1000)}k`;
  return `${trim(n / 1_000_000)}M`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/** Seconds → human duration: 0 → "0s", 65 → "1m 5s", 3725 → "1h 2m". */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/** Fraction (0..1) → "42.5%". */
export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Amount + ISO currency → localized money, e.g. (49, "USD") → "$49.00". */
export function formatMoney(amount: number, currency: string | null): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency ?? "USD",
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region", fallback: "none" })
    : null;

/** ISO-3166 alpha-2 → country name (e.g. "GB" → "United Kingdom"). */
export function countryName(code: string): string {
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

// ---------------------------------------------------------------------------
// Move #1 / Phase 0 — shared comparison + presentation primitives.
// Pure, additive helpers reused by later phases (Hero, Lede, KPI strip,
// Sources, Audience). Nothing here is wired into a page in Phase 0.
// ---------------------------------------------------------------------------

export type DeltaDirection = "up" | "down" | "flat";

/**
 * Period-over-period comparison of two raw values. `pct` is the relative change
 * (null when there is no baseline, i.e. previous === 0); `abs` is the raw
 * difference (used for percentage-point deltas of rates).
 */
export function computeDelta(
  current: number,
  previous: number,
): { direction: DeltaDirection; pct: number | null; abs: number } {
  const abs = current - previous;
  const direction: DeltaDirection = abs > 0 ? "up" : abs < 0 ? "down" : "flat";
  const pct = previous === 0 ? null : abs / previous;
  return { direction, pct, abs };
}

/** Relative delta as a sign-less label: 0.18 → "18%", -0.124 → "12.4%", null → "—". */
export function formatDeltaPct(pct: number | null): string {
  if (pct === null) return "—";
  const p = Math.abs(pct) * 100;
  return `${p.toFixed(p < 10 ? 1 : 0)}%`;
}

/** Percentage-point delta for rates (fractions): 0.006 → "0.6pp". Sign-less. */
export function formatDeltaPoints(absFraction: number): string {
  return `${(Math.abs(absFraction) * 100).toFixed(1)}pp`;
}

/** ISO-3166 alpha-2 country code → flag emoji (e.g. "FR" → 🇫🇷). "" on bad input. */
export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  const BASE = 0x1f1e6; // regional indicator symbol "A"
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    BASE + cc.charCodeAt(0) - 65,
    BASE + cc.charCodeAt(1) - 65,
  );
}

/**
 * First alphanumeric character of a label, uppercased — a privacy-safe avatar
 * fallback that needs no third-party favicon request. "Product Hunt" → "P".
 */
export function monogram(label: string): string {
  const m = label.match(/[a-z0-9]/i);
  return m ? m[0].toUpperCase() : "•";
}
