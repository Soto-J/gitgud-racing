import { LicenseTable, ProfileTable, UserTable } from "@/db/type";
import z from "zod";

export const IRacingMemberDataResponseSchema = z.object({
  success: z.boolean(),
  cust_ids: z.number(),
  members: z.array(
    z.object({
      cust_ids: z.number(),
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
      licenses: z.array(
        z.object({
          category_id: z.number(),
          category: z.string(),
          category_name: z.string(),
          license_level: z.number(),
          safety_rating: z.number(),
          cpi: z.number(),
          irating: z.number(),
          tt_rating: z.number(),
          mpr_num_races: z.number(),
          group_name: z.string(),
          color: z.string(),
          group_id: z.number(),
          pro_promotable: z.boolean(),
          seq: z.number(),
          mpr_num_tts: z.number(),
        }),
      ),
    }),
  ),
  member_since: z.string(),
});

export type IRacingMemberDataResponse = z.infer<
  typeof IRacingMemberDataResponseSchema
>;

export const LicenseDisciplineSchema = z.object({
  category: z.enum(["Oval", "Sports", "Formula", "Dirt Oval", "Dirt Road"]),
  iRating: z.number().nullable(),
  safetyRating: z.string().nullable(),
  licenseClass: z.string(),
});
export type LicenseDiscipline = z.infer<typeof LicenseDisciplineSchema>;

export const IRacingLicenseSchema = z.object({
  category_id: z.number(),
  category: z.string(),
  category_name: z.string(),
  license_level: z.number(),
  safety_rating: z.number(),
  cpi: z.number(),
  irating: z.number(),
  tt_rating: z.number(),
  mpr_num_races: z.number(),
  group_name: z.string(),
  color: z.string(),
  group_id: z.number(),
  pro_promotable: z.boolean(),
  seq: z.number(),
  mpr_num_tts: z.number(),
});
export type IRacingLicense = z.infer<typeof IRacingLicenseSchema>;

export const LicenseClassSchema = z.enum(["A", "B", "C", "D", "R"]);
export type LicenseClass = z.infer<typeof LicenseClassSchema>;

export const TransformLicenseDataSchema = {
  ovalIRating: z.number(),
  ovalSafetyRating: z.string(),
  ovalLicenseClass: LicenseClassSchema,
  sportsCarIRating: z.number(),
  sportsCarSafetyRating: z.string(),
  sportsCarLicenseClass: LicenseClassSchema,
  formulaCarIRating: z.number(),
  formulaCarSafetyRating: z.string(),
  formulaCarLicenseClass: LicenseClassSchema,
  dirtOvalIRating: z.number(),
  dirtOvalSafetyRating: z.string(),
  dirtOvalLicenseClass: LicenseClassSchema,
  dirtRoadIRating: z.number(),
  dirtRoadSafetyRating: z.string(),
  dirtRoadLicenseClass: LicenseClassSchema,
};
export type TransformLicenseData = z.infer<typeof TransformLicenseDataSchema>;

export type IRacingTransformLicensesInput = {
  user: UserTable | null;
  profile: ProfileTable | null;
  licenses: LicenseTable | null;
};
