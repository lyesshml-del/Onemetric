import { z } from "zod";

/** Payload accepted by the ingestion endpoint (`POST /api/collect`). */
export const collectSchema = z.object({
  publicKey: z.string().min(1).max(64),
  type: z.enum(["pageview", "custom"]),
  name: z.string().min(1).max(500),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  utmSource: z.string().max(255).optional(),
  utmMedium: z.string().max(255).optional(),
  utmCampaign: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CollectInput = z.infer<typeof collectSchema>;
