import z from "zod";

export const profileInsertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  team: z.string(),
  isActive: z.boolean(),
  role: z.string(),
});

export const profileUpdateSchema = profileInsertSchema.extend({
  profileId: z.string().min(1, { message: "Id is required" }),
});
