import z from "zod";

export const GetOneInsertSchema = z.object({
  userId: z.string().nullish(),
});

export const EditProfileInsertSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  iRacingId: z.string(),
  // team: z.string(),
  discord: z.string(),
  bio: z.string(),
});

export const EditProfileInputSchema = EditProfileInsertSchema.extend({
  userId: z.string().min(1, { message: "Id is required" }),
});

export const CreateInsertSchema = z.object({ userId: z.string() });
