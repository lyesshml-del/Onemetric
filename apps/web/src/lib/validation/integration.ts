import { z } from "zod";

export const connectPayPalSchema = z.object({
  clientId: z.string().min(1, "Client ID is required.").max(200),
  clientSecret: z.string().min(1, "Client secret is required.").max(200),
  webhookId: z.string().min(1, "Webhook ID is required.").max(200),
  environment: z.enum(["live", "sandbox"]),
});

export type PayPalCredentials = z.infer<typeof connectPayPalSchema>;
