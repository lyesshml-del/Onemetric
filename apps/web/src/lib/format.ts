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
