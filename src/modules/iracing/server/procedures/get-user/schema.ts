import z from "zod";

import { InferSelectModel } from "drizzle-orm";
import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

import { licenseTable } from "@/db/schemas";
import { LicenseTable, ProfileTable, UserTable } from "@/db/schemas/type";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const UserInputSchema = z.object({
  userId: z.string().min(1, { message: "Id is required" }),
});

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Schema for validating the complete response from iRacing's member API
 *
 * This schema validates the response from the `/data/member/get` endpoint
 * which includes user profile information and license data for all racing
 * disciplines. The response structure matches iRacing's official API format.
 *
 * @example
 * ```typescript
 * const response = await fetchData({
 *   query: `/data/member/get?cust_ids=123456&include_licenses=true`
 * });
 * const validatedData = UserResponseSchema.parse(response);
 * ```
 */
export const UserResponseSchema = z.object({
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

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const LicenseSchema = z.object({
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

export type LicenseType = z.infer<typeof LicenseSchema>;

// =============================================================================
// DATA TRANSFORMATION SCHEMAS
// =============================================================================

/**
 * Schema for validating iRacing license classes
 *
 * iRacing uses a letter-based license classification system:
 * - R: Rookie (starting level)
 * - D: Class D
 * - C: Class C
 * - B: Class B
 * - A: Class A (highest level)
 */
export const LicenseClassSchema = z.enum(["A", "B", "C", "D", "R"]);

export type LicenseClass = z.infer<typeof LicenseClassSchema>;

/**
 * Schema for the flattened license data structure used in the database
 *
 * This schema represents license information for all racing disciplines
 * in a flat structure optimized for database storage. Each discipline
 * (Oval, Sports Car, Formula Car, Dirt Oval, Dirt Road) has separate
 * fields for iRating, safety rating, and license class.
 *
 * @example
 * ```typescript
 * const dbLicenseData = {
 *   ovalIRating: 2500,
 *   ovalSafetyRating: "3.45",
 *   ovalLicenseClass: "A",
 *   // ... other disciplines
 * };
 * const validated = TransformLicenseDataSchema.parse(dbLicenseData);
 * ```
 */
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

/**
 * Schema for individual racing discipline data in the client response format
 *
 * This represents how license data for a single discipline is structured
 * in the API response sent to clients. It's used to build the disciplines
 * array that provides a cleaner, more organized view of the license data.
 *
 * @example
 * ```typescript
 * const discipline = {
 *   category: "Oval",
 *   iRating: 2500,
 *   safetyRating: "3.45",
 *   licenseClass: "A"
 * };
 * const validated = LicenseDisciplineSchema.parse(discipline);
 * ```
 */
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

export type TransformLicensesInput = {
  user: UserTable | null;
  profile: ProfileTable | null;
  licenses: LicenseTable | null;
};

// =============================================================================
// ROUTER OUTPUT TYPES
// =============================================================================

export type UserData = inferRouterOutputs<AppRouter>["iracing"]["getUser"];
