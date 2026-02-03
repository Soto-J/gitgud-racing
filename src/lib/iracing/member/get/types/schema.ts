import { z } from "zod";

export const MemberGetInputSchema = z.object({
  custId: z.string(),
});

export const LicenseSchema = z.object({
  category_id: z.number(),
  category: z.string(),
  category_name: z.string(),
  license_level: z.number(),
  safety_rating: z.number(),
  cpi: z.number(),
  irating: z.number().nullish(),
  tt_rating: z.number(),
  mpr_num_races: z.number(),
  group_name: z.string(),
  color: z.string(),
  group_id: z.number(),
  pro_promotable: z.boolean(),
  seq: z.number(),
  mpr_num_tts: z.number(),
});

export const MemberGetResponseSchema = z.object({
  success: z.boolean().optional(),
  cust_ids: z.array(z.number()).optional(),
  members: z.array(
    z.object({
      cust_id: z.number(),
      display_name: z.string(),
      helmet: z.object({
        pattern: z.number(),
        color1: z.string(),
        color2: z.string(),
        color3: z.string(),
        face_type: z.number(),
        helmet_type: z.number(),
      }),
      last_login: z.string(),
      member_since: z.string(),
      flair_id: z.number(),
      flair_name: z.string(),
      flair_shortname: z.string(),
      ai: z.boolean(),
      licenses: z.array(LicenseSchema),
    }),
  ),
});
