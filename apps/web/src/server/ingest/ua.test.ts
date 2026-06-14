import { describe, it, expect } from "vitest";
import { DeviceType } from "@prisma/client";
import { parseUserAgent } from "./ua";

describe("parseUserAgent", () => {
  it("detects desktop Chrome on Windows", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    );
    expect(r).toEqual({
      device: DeviceType.DESKTOP,
      browser: "Chrome",
      os: "Windows",
    });
  });

  it("detects mobile Safari on iOS", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    expect(r.device).toBe(DeviceType.MOBILE);
    expect(r.browser).toBe("Safari");
    expect(r.os).toBe("iOS");
  });

  it("detects an Android tablet (no 'mobile' token)", () => {
    const r = parseUserAgent(
      "Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    );
    expect(r.device).toBe(DeviceType.TABLET);
    expect(r.os).toBe("Android");
  });

  it("returns UNKNOWN for an empty UA", () => {
    expect(parseUserAgent("")).toEqual({
      device: DeviceType.UNKNOWN,
      browser: null,
      os: null,
    });
  });
});
