import { z } from "zod";

export const ProfileSchema = z.object({
  email: z.email(),
  discord: z.string().max(32),
  bio: z.string(),
});
