import { describe, it, expect } from "vitest";
import { encryptJson, decryptJson } from "./crypto";

describe("crypto", () => {
  it("round-trips an object", () => {
    const value = {
      clientId: "abc",
      clientSecret: "shh",
      webhookId: "WH-1",
      environment: "sandbox" as const,
    };
    const cipher = encryptJson(value);
    expect(cipher).not.toContain("shh");
    expect(decryptJson(cipher)).toEqual(value);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    expect(encryptJson({ a: 1 })).not.toBe(encryptJson({ a: 1 }));
  });

  it("rejects a tampered payload", () => {
    const cipher = encryptJson({ a: 1 });
    const tampered = cipher.slice(0, -2) + "xx";
    expect(() => decryptJson(tampered)).toThrow();
  });
});
