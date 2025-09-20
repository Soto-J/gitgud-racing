import { z } from "zod";

export const ProfileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  iRacingId: z.string(),
  discord: z.string(),
  bio: z.string(),
});

export const ProfileUpdateSchema = ProfileSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});
