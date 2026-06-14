import { describe, it, expect } from "vitest";
import { EventType, FunnelMatchType } from "@prisma/client";
import { computeFunnel, type FunnelEvent } from "./funnels";

const steps = [
  { order: 0, matchType: FunnelMatchType.PAGEVIEW_PATH, matchValue: "/" },
  { order: 1, matchType: FunnelMatchType.PAGEVIEW_PATH, matchValue: "/pricing" },
  { order: 2, matchType: FunnelMatchType.CUSTOM_EVENT, matchValue: "signup" },
];

const pv = (sessionId: string, path: string): FunnelEvent => ({
  sessionId,
  type: EventType.PAGEVIEW,
  name: path,
  path,
});
const ev = (sessionId: string, name: string): FunnelEvent => ({
  sessionId,
  type: EventType.CUSTOM,
  name,
  path: null,
});

// Ordered by session, then time (as the DB query would return).
const events: FunnelEvent[] = [
  pv("fs1", "/"), pv("fs1", "/pricing"), ev("fs1", "signup"), // reaches step 3
  pv("fs2", "/"), pv("fs2", "/pricing"), // reaches step 2
  pv("fs3", "/"), // reaches step 1
  pv("fs4", "/pricing"), pv("fs4", "/"), // out of order -> step 1 only
  pv("fs5", "/"), ev("fs5", "signup"), // skips /pricing -> step 1 only
];

describe("computeFunnel", () => {
  it("counts sessions reaching each step, respecting order", () => {
    const result = computeFunnel(events, steps);
    expect(result.steps.map((s) => s.count)).toEqual([5, 2, 1]);
  });

  it("computes entered, conversion and drop-off", () => {
    const result = computeFunnel(events, steps);
    expect(result.entered).toBe(5);
    expect(result.overallConversion).toBeCloseTo(0.2);
    expect(result.steps[1].conversion).toBeCloseTo(0.4);
    expect(result.steps[1].dropFromPrev).toBe(3);
    expect(result.steps[2].dropFromPrev).toBe(1);
  });

  it("handles no events", () => {
    const result = computeFunnel([], steps);
    expect(result.entered).toBe(0);
    expect(result.overallConversion).toBe(0);
    expect(result.steps.map((s) => s.count)).toEqual([0, 0, 0]);
  });
});
