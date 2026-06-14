import { describe, it, expect } from "vitest";
import { parseCustomId, extractCapture } from "./paypal";

describe("parseCustomId", () => {
  it("parses utm params", () => {
    expect(parseCustomId("utm_source=newsletter&utm_campaign=launch")).toEqual({
      utmSource: "newsletter",
      utmCampaign: "launch",
      sessionId: null,
    });
  });
  it("parses an om_session reference", () => {
    expect(parseCustomId("om_session=sess_123")).toEqual({
      utmSource: null,
      utmCampaign: null,
      sessionId: "sess_123",
    });
  });
  it("returns nulls for empty input", () => {
    expect(parseCustomId(null)).toEqual({
      utmSource: null,
      utmCampaign: null,
      sessionId: null,
    });
  });
});

describe("extractCapture", () => {
  it("extracts a completed capture", () => {
    const capture = extractCapture({
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAP-1",
        amount: { value: "49.00", currency_code: "USD" },
        create_time: "2026-06-01T12:00:00Z",
        custom_id: "utm_source=x",
      },
    });
    expect(capture).not.toBeNull();
    expect(capture?.externalId).toBe("CAP-1");
    expect(capture?.amount).toBe("49.00");
    expect(capture?.currency).toBe("USD");
    expect(capture?.customId).toBe("utm_source=x");
    expect(capture?.occurredAt).toBeInstanceOf(Date);
  });

  it("ignores non-capture events", () => {
    expect(
      extractCapture({ event_type: "PAYMENT.SALE.COMPLETED" }),
    ).toBeNull();
  });

  it("ignores captures missing an amount", () => {
    expect(
      extractCapture({
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: { id: "CAP-2" },
      }),
    ).toBeNull();
  });
});
