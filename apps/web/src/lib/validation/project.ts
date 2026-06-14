import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  domain: z
    .string()
    .min(1, "Domain is required.")
    .max(255)
    .transform((d) =>
      d
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .toLowerCase(),
    ),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
