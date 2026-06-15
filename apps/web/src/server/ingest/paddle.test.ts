import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyPaddleSignature, planForStatus } from "./paddle";

const SECRET = "pdl_ntfset_test_secret";

function sign(rawBody: string, ts: string, secret = SECRET): string {
  const h1 = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");
  return `ts=${ts};h1=${h1}`;
}

describe("verifyPaddleSignature", () => {
  const body = JSON.stringify({ event_type: "subscription.created", data: {} });
  const ts = "1700000000";

  it("accepts a correctly signed body", () => {
    expect(verifyPaddleSignature(body, sign(body, ts), SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const header = sign(body, ts);
    expect(verifyPaddleSignature(body + " ", header, SECRET)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    expect(verifyPaddleSignature(body, sign(body, ts), "wrong")).toBe(false);
  });

  it("rejects a missing/malformed header", () => {
    expect(verifyPaddleSignature(body, null, SECRET)).toBe(false);
    expect(verifyPaddleSignature(body, "garbage", SECRET)).toBe(false);
    expect(verifyPaddleSignature(body, `ts=${ts}`, SECRET)).toBe(false);
  });
});

describe("planForStatus", () => {
  it("grants PRO during trial, active, and dunning", () => {
    expect(planForStatus("trialing")).toBe("PRO");
    expect(planForStatus("active")).toBe("PRO");
    expect(planForStatus("past_due")).toBe("PRO");
  });

  it("drops to FREE when paused, canceled, or unknown", () => {
    expect(planForStatus("paused")).toBe("FREE");
    expect(planForStatus("canceled")).toBe("FREE");
    expect(planForStatus(undefined)).toBe("FREE");
  });
});
