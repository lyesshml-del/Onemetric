import { z } from "zod";

export const addSubscriptionSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});
