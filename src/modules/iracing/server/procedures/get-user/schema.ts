import z from "zod";
import { InferSelectModel } from "drizzle-orm";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";
import { licenseTable } from "@/db/schema";
import { ProfileTable, UserTable } from "@/db/type";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const IRacingGetUserInputSchema = z.object({
  userId: z.string().min(1, { message: "Id is required" }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

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

// =============================================================================
// DATA TRANSFORMATION SCHEMAS
// =============================================================================

export const LicenseClassSchema = z.enum(["A", "B", "C", "D", "R"]);

export type LicenseClass = z.infer<typeof LicenseClassSchema>;

export const TransformLicenseDataSchema = z.object({
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
});

export type TransformLicenseData = z.infer<typeof TransformLicenseDataSchema>;

export const LicenseDisciplineSchema = z.object({
  category: z.enum(["Oval", "Sports", "Formula", "Dirt Oval", "Dirt Road"]),
  iRating: z.number().nullable(),
  safetyRating: z.string().nullable(),
  licenseClass: LicenseClassSchema,
});

export type LicenseDiscipline = z.infer<typeof LicenseDisciplineSchema>;

// =============================================================================
// INTERNAL TYPE DEFINITIONS
// =============================================================================

export type IRacingTransformLicensesInput = {
  user: UserTable | null;
  profile: ProfileTable | null;
  licenses: InferSelectModel<typeof licenseTable> | null;
};

export type IRacingMemberData = {
  success: boolean;
  cust_ids: number[];
  members: {
    cust_id: number;
    display_name: string;
    helmet: {
      pattern: number;
      color1: string;
      color2: string;
      color3: string;
      face_type: number;
      helmet_type: number;
    };
    last_login: string;
    member_since: string;
    flair_id: number;
    flair_name: string;
    flair_shortname: string;
    ai: boolean;
    licenses: IRacingLicense[];
  }[];
  member_since: string;
};

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type IRacingUserData =
  inferRouterOutputs<AppRouter>["iracing"]["getUser"];