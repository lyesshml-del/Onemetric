export const RANGES = {
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
  "90d": { label: "Last 90 days", days: 90 },
} as const;

export type RangeKey = keyof typeof RANGES;

export const DEFAULT_RANGE: RangeKey = "7d";

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && value in RANGES;
}

/** Inclusive list of UTC day strings (YYYY-MM-DD) between two dates. */
export function eachUtcDay(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  );
  while (cursor <= end) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/** Resolves a range key (defaulting safely) into a concrete date window. */
export function resolveRange(value: unknown): {
  key: RangeKey;
  from: Date;
  to: Date;
  days: number;
} {
  const key = isRangeKey(value) ? value : DEFAULT_RANGE;
  const days = RANGES[key].days;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { key, from, to, days };
}

/**
 * Move #1 / Phase 0 — the immediately-prior window of equal length, for
 * period-over-period comparison. For [from, to] returns [from - len, from],
 * where len = to - from. The shared boundary instant `from` is immaterial for
 * analytics windows. Additive; consumed by `getOverviewMetricsDelta`.
 */
export function previousRange(
  from: Date,
  to: Date,
): { from: Date; to: Date } {
  const len = to.getTime() - from.getTime();
  return { from: new Date(from.getTime() - len), to: new Date(from.getTime()) };
}

/** Human period label for the Lede: "this week" | "this month" | "this quarter". */
export function rangePeriodWord(key: RangeKey): string {
  return key === "7d"
    ? "this week"
    : key === "30d"
      ? "this month"
      : "this quarter";
}
