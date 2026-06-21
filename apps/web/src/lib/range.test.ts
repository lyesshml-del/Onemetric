import { describe, it, expect } from "vitest";
import {
  isRangeKey,
  resolveRange,
  eachUtcDay,
  previousRange,
  rangePeriodWord,
  recoveryThreshold,
  DEFAULT_RANGE,
} from "./range";

describe("isRangeKey", () => {
  it("accepts known keys and rejects others", () => {
    expect(isRangeKey("7d")).toBe(true);
    expect(isRangeKey("30d")).toBe(true);
    expect(isRangeKey("bogus")).toBe(false);
    expect(isRangeKey(undefined)).toBe(false);
  });
});

describe("resolveRange", () => {
  it("defaults safely on bad input", () => {
    expect(resolveRange("nonsense").key).toBe(DEFAULT_RANGE);
  });
  it("computes a window of the right length", () => {
    const { key, from, to, days } = resolveRange("30d");
    expect(key).toBe("30d");
    expect(days).toBe(30);
    const spanDays = Math.round((to.getTime() - from.getTime()) / 86400000);
    expect(spanDays).toBe(30);
  });
});

describe("eachUtcDay", () => {
  it("is inclusive of both ends", () => {
    const days = eachUtcDay(
      new Date("2026-06-01T10:00:00Z"),
      new Date("2026-06-03T05:00:00Z"),
    );
    expect(days).toEqual(["2026-06-01", "2026-06-02", "2026-06-03"]);
  });
  it("returns a single day when from == to", () => {
    const days = eachUtcDay(
      new Date("2026-06-01T00:00:00Z"),
      new Date("2026-06-01T23:59:59Z"),
    );
    expect(days).toEqual(["2026-06-01"]);
  });
});

describe("previousRange", () => {
  it("returns the immediately-prior window of equal length", () => {
    const from = new Date("2026-06-08T00:00:00Z");
    const to = new Date("2026-06-15T00:00:00Z"); // 7-day window
    const len = to.getTime() - from.getTime();
    const prev = previousRange(from, to);

    // ends exactly where the current window begins
    expect(prev.to.toISOString()).toBe(from.toISOString());
    // starts one window-length earlier
    expect(prev.from.toISOString()).toBe(
      new Date(from.getTime() - len).toISOString(),
    );
    // same length as the current window
    expect(prev.to.getTime() - prev.from.getTime()).toBe(len);
  });
});

describe("rangePeriodWord", () => {
  it("maps range keys to natural period words", () => {
    expect(rangePeriodWord("7d")).toBe("this week");
    expect(rangePeriodWord("30d")).toBe("this month");
    expect(rangePeriodWord("90d")).toBe("this quarter");
  });
});

describe("recoveryThreshold", () => {
  it("returns the cutoff exactly `ageDays` days before now", () => {
    const now = new Date("2026-06-21T07:30:00.000Z");
    expect(recoveryThreshold(now, 2).toISOString()).toBe(
      "2026-06-19T07:30:00.000Z",
    );
  });

  it("includes anything created at or before the cutoff (open-ended)", () => {
    // ONE-81: a project is stalled when createdAt <= threshold — so both a
    // just-past-threshold and a very old project qualify (dedup is the
    // persistent flag, not the window).
    const now = new Date("2026-06-21T00:00:00.000Z");
    const cutoff = recoveryThreshold(now, 2); // 2026-06-19T00:00Z
    const justOldEnough = new Date("2026-06-18T23:00:00.000Z");
    const veryOld = new Date("2026-01-01T00:00:00.000Z");
    const tooNew = new Date("2026-06-20T12:00:00.000Z");
    expect(justOldEnough <= cutoff).toBe(true);
    expect(veryOld <= cutoff).toBe(true);
    expect(tooNew <= cutoff).toBe(false);
  });
});
