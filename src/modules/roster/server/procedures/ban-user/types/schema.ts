import { z } from "zod";

export const BanUserFieldsSchema = z.object({
  banned: z.boolean(),
  banReason: z.string().min(1, { message: "Reason required" }),
});

export const BanUserInputSchema = BanUserFieldsSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});
