import { describe, it, expect } from "vitest";
import { computeVisitorHash } from "./visitor";

const base = {
  ip: "81.2.69.142",
  userAgent: "Mozilla/5.0",
  projectId: "proj_1",
  day: "2026-06-14",
};

describe("computeVisitorHash", () => {
  it("is deterministic for the same inputs", () => {
    expect(computeVisitorHash(base)).toBe(computeVisitorHash(base));
  });

  it("produces a 64-char hex sha256", () => {
    expect(computeVisitorHash(base)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rotates with the day (no cross-day tracking)", () => {
    expect(computeVisitorHash(base)).not.toBe(
      computeVisitorHash({ ...base, day: "2026-06-15" }),
    );
  });

  it("differs by IP, project and user-agent", () => {
    const h = computeVisitorHash(base);
    expect(computeVisitorHash({ ...base, ip: "1.1.1.1" })).not.toBe(h);
    expect(computeVisitorHash({ ...base, projectId: "proj_2" })).not.toBe(h);
    expect(computeVisitorHash({ ...base, userAgent: "other" })).not.toBe(h);
  });
});
