import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatDuration,
  formatPercent,
  formatMoney,
  countryName,
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
