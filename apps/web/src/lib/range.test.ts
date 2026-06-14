import { describe, it, expect } from "vitest";
import { isRangeKey, resolveRange, eachUtcDay, DEFAULT_RANGE } from "./range";

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
