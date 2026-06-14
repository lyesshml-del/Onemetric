import { describe, it, expect } from "vitest";
import { collectSchema } from "./collect";
import { createFunnelSchema } from "./funnel";
import { connectPayPalSchema } from "./integration";

describe("collectSchema", () => {
  it("accepts a valid pageview", () => {
    const r = collectSchema.safeParse({
      publicKey: "om_abc",
      type: "pageview",
      name: "/",
    });
    expect(r.success).toBe(true);
  });
  it("rejects a missing publicKey and a bad type", () => {
    expect(
      collectSchema.safeParse({ type: "pageview", name: "/" }).success,
    ).toBe(false);
    expect(
      collectSchema.safeParse({ publicKey: "x", type: "click", name: "/" })
        .success,
    ).toBe(false);
  });
});

describe("createFunnelSchema", () => {
  it("requires at least two steps", () => {
    const ok = createFunnelSchema.safeParse({
      name: "Signup flow",
      steps: [
        { matchType: "PAGEVIEW_PATH", matchValue: "/" },
        { matchType: "CUSTOM_EVENT", matchValue: "signup" },
      ],
    });
    expect(ok.success).toBe(true);
    const tooFew = createFunnelSchema.safeParse({
      name: "x",
      steps: [{ matchType: "PAGEVIEW_PATH", matchValue: "/" }],
    });
    expect(tooFew.success).toBe(false);
  });
});

describe("connectPayPalSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      connectPayPalSchema.safeParse({
        clientId: "id",
        clientSecret: "secret",
        webhookId: "WH-1",
        environment: "sandbox",
      }).success,
    ).toBe(true);
  });
  it("rejects an invalid environment", () => {
    expect(
      connectPayPalSchema.safeParse({
        clientId: "id",
        clientSecret: "secret",
        webhookId: "WH-1",
        environment: "prod",
      }).success,
    ).toBe(false);
  });
});
