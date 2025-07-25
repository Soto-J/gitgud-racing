import z from "zod";

export const profileInsertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  iRacingId: z.string(),
  iRating: z.string(),
  sRating: z.string(),
  discord: z.string(),
  team: z.string(),
  bio: z.string(),
});
