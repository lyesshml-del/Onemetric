import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatDuration,
  formatPercent,
  formatMoney,
  countryName,
  computeDelta,
  formatDeltaPct,
  formatDeltaPoints,
  flagEmoji,
  monogram,
} from "./format";

describe("formatNumber", () => {
  it("leaves small numbers as-is", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });
  it("compacts thousands and millions", () => {
    expect(formatNumber(1000)).toBe("1k");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(1_500_000)).toBe("1.5M");
  });
});

describe("formatDuration", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(65)).toBe("1m 5s");
    expect(formatDuration(3725)).toBe("1h 2m");
  });
});

describe("formatPercent", () => {
  it("formats a fraction", () => {
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(0.333)).toBe("33.3%");
    expect(formatPercent(1)).toBe("100.0%");
  });
});

describe("formatMoney", () => {
  it("formats with currency", () => {
    expect(formatMoney(49, "USD")).toContain("49");
    expect(formatMoney(49, "USD")).toContain("$");
  });
  it("falls back when currency is null", () => {
    expect(formatMoney(10, null)).toContain("10");
  });
});

describe("countryName", () => {
  it("maps ISO codes to names", () => {
    expect(countryName("GB")).toBe("United Kingdom");
    expect(countryName("US")).toBe("United States");
  });
  it("returns the input when the code is malformed", () => {
    expect(countryName("??")).toBe("??");
  });
});

// --- Move #1 / Phase 0 primitives ---

describe("computeDelta", () => {
  it("detects up / down / flat", () => {
    expect(computeDelta(120, 100).direction).toBe("up");
    expect(computeDelta(80, 100).direction).toBe("down");
    expect(computeDelta(100, 100).direction).toBe("flat");
  });
  it("computes relative pct and raw abs", () => {
    expect(computeDelta(120, 100).pct).toBeCloseTo(0.2);
    expect(computeDelta(120, 100).abs).toBe(20);
  });
  it("returns null pct when there is no baseline", () => {
    expect(computeDelta(50, 0).pct).toBeNull();
    expect(computeDelta(50, 0).direction).toBe("up");
  });
});

describe("formatDeltaPct", () => {
  it("formats sign-less percentages", () => {
    expect(formatDeltaPct(0.18)).toBe("18%");
    expect(formatDeltaPct(-0.18)).toBe("18%");
    expect(formatDeltaPct(0.054)).toBe("5.4%");
  });
  it("shows an em dash when there is no baseline", () => {
    expect(formatDeltaPct(null)).toBe("—");
  });
});

describe("formatDeltaPoints", () => {
  it("formats a percentage-point delta", () => {
    expect(formatDeltaPoints(0.006)).toBe("0.6pp");
    expect(formatDeltaPoints(-0.012)).toBe("1.2pp");
  });
});

describe("flagEmoji", () => {
  it("maps ISO codes to flag emoji", () => {
    expect(flagEmoji("FR")).toBe("🇫🇷");
    expect(flagEmoji("us")).toBe("🇺🇸");
  });
  it("returns an empty string on bad input", () => {
    expect(flagEmoji("USA")).toBe("");
    expect(flagEmoji("?")).toBe("");
  });
});

describe("monogram", () => {
  it("returns the first alphanumeric char, uppercased", () => {
    expect(monogram("Product Hunt")).toBe("P");
    expect(monogram("  google.com")).toBe("G");
    expect(monogram("123abc")).toBe("1");
  });
  it("falls back to a bullet when there is no alphanumeric char", () => {
    expect(monogram("—")).toBe("•");
    expect(monogram("")).toBe("•");
  });
});
