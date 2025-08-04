import z from "zod";

export const profileInsertSchema = z.object({
  team: z.string(),
  isActive: z.boolean(),
  role: z.string(),
});

export const profileUpdateSchema = profileInsertSchema.extend({
  userId: z.string().min(1, { message: "Id is required" }),
});
