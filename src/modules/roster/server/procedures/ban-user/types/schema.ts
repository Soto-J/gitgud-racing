import { z } from "zod";

export const BanUserFieldsSchema = z
  .object({
    banned: z.boolean(),
    banReason: z.string().optional(),
  })
  .refine((data) => !data.banned || !!data.banReason?.trim(), {
    message: "Reason required",
    path: ["banReason"],
  });

export const BanUserInputSchema = BanUserFieldsSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});
