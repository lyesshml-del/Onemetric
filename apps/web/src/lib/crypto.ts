import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM encryption for credentials at rest. The key is a 32-byte hex
// string in `CREDENTIALS_KEY`. Output format: base64(iv):base64(tag):base64(data).
const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.CREDENTIALS_KEY ?? "";
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("CREDENTIALS_KEY must be a 32-byte hex string (64 hex chars).");
  }
  return key;
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    data.toString("base64"),
  ].join(":");
}

export function decryptJson<T>(payload: string): T {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const data = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(data.toString("utf8")) as T;
}
