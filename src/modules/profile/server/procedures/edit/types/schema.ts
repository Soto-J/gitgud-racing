import { z } from "zod";

export const ProfileSchema = z.object({
  email: z.email(),
  discord: z.string(),
  bio: z.string(),
});

export const ProfileUpdateSchema = ProfileSchema.extend({
  userId: z.string().min(1, { message: "User ID is required" }),
});
