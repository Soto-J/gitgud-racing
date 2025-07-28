import { safetyClassValues } from "@/db/schema";

import z from "zod";

export const profileInsertSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  iRacingId: z.string(),
  iRating: z.string(),
  safetyClass: z.enum(safetyClassValues),
  safetyRating: z.string(),
  team: z.string(),
  discord: z.string(),
  bio: z.string(),
});

export const profileUpdateSchema = profileInsertSchema.extend({
  profileId: z.string().min(1, { message: "Id is required" }),
});
