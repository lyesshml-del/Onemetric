import { createHash } from "crypto";

/**
 * Cookieless visitor identifier. A daily-rotating salt component (the date) means
 * the same visitor produces a different hash each day, so no stable cross-day
 * identifier is stored — privacy-friendly and GDPR-light (no cookie banner).
 */
export function computeVisitorHash(params: {
  ip: string;
  userAgent: string;
  projectId: string;
  day?: string;
}): string {
  const salt = process.env.VISITOR_HASH_SALT ?? "";
  const day = params.day ?? new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${salt}:${params.projectId}:${params.ip}:${params.userAgent}:${day}`)
    .digest("hex");
}
