import { describe, expect, it } from "vitest";
import { countUpValue, easeOutCubic } from "./motion";

describe("easeOutCubic", () => {
  it("anchors at 0 and 1", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("clamps out-of-range progress", () => {
    expect(easeOutCubic(-0.5)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it("decelerates — past the midpoint by t=0.5 (1 - 0.5^3 = 0.875)", () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 6);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it("is monotonically non-decreasing", () => {
    let prev = -Infinity;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = easeOutCubic(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
});

describe("countUpValue", () => {
  it("returns `from` at progress 0 and `to` at progress 1", () => {
    expect(countUpValue(0, 100, 0)).toBe(0);
    expect(countUpValue(0, 100, 1)).toBe(100);
    expect(countUpValue(20, 80, 0)).toBe(20);
    expect(countUpValue(20, 80, 1)).toBe(80);
  });

  it("eases — ~87.5% of the way at t=0.5", () => {
    expect(countUpValue(0, 100, 0.5)).toBeCloseTo(87.5, 6);
  });

  it("works for descending ranges", () => {
    expect(countUpValue(100, 0, 0)).toBe(100);
    expect(countUpValue(100, 0, 1)).toBe(0);
  });

  it("clamps progress at both ends", () => {
    expect(countUpValue(0, 100, 2)).toBe(100);
    expect(countUpValue(0, 100, -1)).toBe(0);
  });
});
