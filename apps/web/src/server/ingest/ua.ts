import { DeviceType } from "@prisma/client";

export type ParsedUserAgent = {
  device: DeviceType;
  browser: string | null;
  os: string | null;
};

/**
 * Minimal, dependency-free User-Agent parsing — enough for the V1 breakdowns
 * (device / browser / OS). Can be swapped for a fuller parser later if needed.
 */
export function parseUserAgent(ua: string): ParsedUserAgent {
  if (!ua) return { device: DeviceType.UNKNOWN, browser: null, os: null };

  return {
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOS(ua),
  };
}

function detectDevice(ua: string): DeviceType {
  if (/ipad|tablet|(android(?!.*mobile))|kindle|silk|playbook/i.test(ua)) {
    return DeviceType.TABLET;
  }
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return DeviceType.MOBILE;
  }
  return DeviceType.DESKTOP;
}

function detectBrowser(ua: string): string | null {
  if (/edg(e|ios|a)?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return null;
}

function detectOS(ua: string): string | null {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  return null;
}
