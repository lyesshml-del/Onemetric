import { describe, it, expect } from "vitest";
import { buildLede, type LedeToken } from "./lede";
import type { OverviewMetrics } from "@/server/queries/analytics";

// Minimal metrics builder — only uniqueVisitors matters for the Phase B Lede.
const M = (uniqueVisitors: number): OverviewMetrics => ({
  uniqueVisitors,
  sessions: uniqueVisitors,
  pageviews: uniqueVisitors,
  pagesPerSession: 1,
  avgDurationSec: 0,
  bounceRate: 0,
});

const sentence = (tokens: LedeToken[]) => tokens.map((t) => t.text).join("");

describe("buildLede (Phase B — traffic-only)", () => {
  const base = { periodWord: "this week", projectId: "p1" };

  it("increasing traffic, with a top source", () => {
    const t = buildLede({
      ...base,
      current: M(2430),
      previous: M(2060),
      topSource: { label: "producthunt.com" },
    });
    expect(sentence(t)).toBe(
      "Traffic is up 18% this week — 2.4k visitors, led by producthunt.com.",
    );
  });

  it("decreasing traffic, no source", () => {
    const t = buildLede({
      ...base,
      current: M(1800),
      previous: M(2060),
      topSource: null,
    });
    expect(sentence(t)).toBe("Traffic is down 13% this week — 1.8k visitors.");
  });

  it("a tiny change reads as steady (no noisy percentage)", () => {
    const t = buildLede({ ...base, current: M(2065), previous: M(2060) });
    expect(sentence(t)).toBe("Traffic is steady this week — 2.1k visitors.");
  });

  it("exactly equal reads as steady", () => {
    const t = buildLede({ ...base, current: M(2060), previous: M(2060) });
    expect(sentence(t)).toBe("Traffic is steady this week — 2.1k visitors.");
  });

  it("no baseline period states the current figure plainly", () => {
    const t = buildLede({
      ...base,
      current: M(50),
      previous: M(0),
      topSource: { label: "github.com" },
    });
    expect(sentence(t)).toBe("50 visitors this week, led by github.com.");
  });

  it("uses the singular for one visitor", () => {
    const t = buildLede({ ...base, current: M(1), previous: M(0) });
    expect(sentence(t)).toBe("1 visitor this week.");
  });

  it("handles zero traffic", () => {
    const t = buildLede({ ...base, current: M(0), previous: M(0) });
    expect(sentence(t)).toBe("No visitors recorded this week yet.");
  });

  it("respects the period word (month / quarter)", () => {
    expect(
      sentence(
        buildLede({
          ...base,
          periodWord: "this month",
          current: M(900),
          previous: M(600),
        }),
      ),
    ).toBe("Traffic is up 50% this month — 900 visitors.");
  });

  it("emphasizes data nouns and never links without a drill target (Phase B)", () => {
    const t = buildLede({
      ...base,
      current: M(2430),
      previous: M(2060),
      topSource: { label: "producthunt.com" },
    });
    const emphasized = t.filter((x) => x.emphasis).map((x) => x.text);
    expect(emphasized).toContain("18%");
    expect(emphasized).toContain("2.4k visitors");
    expect(emphasized).toContain("producthunt.com");
    expect(t.every((x) => x.href === undefined)).toBe(true);
  });

  // --- Phase E: funnel clause ---

  it("appends a funnel clause after the traffic clause", () => {
    const t = buildLede({
      ...base,
      current: M(2430),
      previous: M(2060),
      topSource: { label: "producthunt.com" },
      funnel: { name: "Signup", conversion: 0.042 },
    });
    expect(sentence(t)).toBe(
      "Traffic is up 18% this week — 2.4k visitors, led by producthunt.com. Signup converts at 4.2%.",
    );
  });

  it("appends the funnel clause after a no-baseline traffic clause", () => {
    const t = buildLede({
      ...base,
      current: M(50),
      previous: M(0),
      funnel: { name: "Checkout", conversion: 0.1 },
    });
    expect(sentence(t)).toBe("50 visitors this week. Checkout converts at 10.0%.");
  });

  it("links the funnel conversion when an href is provided", () => {
    const t = buildLede({
      ...base,
      current: M(900),
      previous: M(600),
      funnel: {
        name: "Signup",
        conversion: 0.042,
        href: "/dashboard/p1/funnels/f1",
      },
    });
    const conv = t.find((x) => x.text === "4.2%");
    expect(conv?.href).toBe("/dashboard/p1/funnels/f1");
    expect(conv?.emphasis).toBe(true);
  });
});
