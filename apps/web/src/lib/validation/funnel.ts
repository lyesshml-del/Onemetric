import { z } from "zod";

export const createFunnelSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  steps: z
    .array(
      z.object({
        matchType: z.enum(["PAGEVIEW_PATH", "CUSTOM_EVENT"]),
        matchValue: z.string().min(1).max(500),
      }),
    )
    .min(2, "Add at least two steps.")
    .max(10, "Funnels support up to 10 steps."),
});

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>;
