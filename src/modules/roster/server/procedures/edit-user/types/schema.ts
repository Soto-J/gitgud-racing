import { z } from "zod";

export const EditUserFieldsSchema = z.object({
  team: z.string(),
  isActive: z.boolean(),
  role: z.enum(["admin", "staff", "user", "guest"]),
});

export const EditUserInputSchema = EditUserFieldsSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});
