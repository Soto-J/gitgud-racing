import { z } from "zod";

import { LicenseTable, ProfileTable, UserTable } from "@/db/schemas/type";

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Input validation schema for getUserProcedure
 *
 * Validates the input parameters required to fetch user data. The userId
 * must be a non-empty string that corresponds to an existing user in the
 * database.
 *
 * @example
 * ```typescript
 * const input = UserInputSchema.parse({ userId: "user_123" });
 * ```
 */
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
/**
 * Schema for individual license data from iRacing API
 *
 * Validates the structure of license information for a single racing discipline
 * as returned by iRacing's member API. Each license contains ratings, safety
 * data, and classification information.
 *
 * @example
 * ```typescript
 * const license = LicenseSchema.parse({
 *   category_id: 1,
 *   category: "oval",
 *   category_name: "Oval",
 *   license_level: 16,
 *   safety_rating: 3.45,
 *   irating: 2500,
 *   group_name: "Class A",
 *   // ... other fields
 * });
 * ```
 */
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

export const UserResponseSchema = z.object({
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

/**
 * Schema for iRacing license class validation
 *
 * Represents the possible license classes in iRacing:
 * - A: Class A (highest)
 * - B: Class B
 * - C: Class C
 * - D: Class D
 * - R: Rookie (lowest)
 */
export const LicenseClassSchema = z.enum(["A", "B", "C", "D", "R"]);

/**
 * Schema for database-formatted license data
 *
 * Validates the transformed license data structure used for database storage.
 * This flattened format stores each discipline's data separately with
 * normalized field names for consistent database operations.
 *
 * Each discipline (Oval, Sports Car, Formula Car, Dirt Oval, Dirt Road) has:
 * - iRating: Skill rating (typically 1350-5000+)
 * - safetyRating: Safety rating as string (e.g., "3.45")
 * - licenseClass: License class enum (A, B, C, D, R)
 *
 * @example
 * ```typescript
 * const transformedData = TransformLicenseDataSchema.parse({
 *   ovalIRating: 2500,
 *   ovalSafetyRating: "3.45",
 *   ovalLicenseClass: "A",
 *   sportsCarIRating: 1800,
 *   sportsCarSafetyRating: "2.85",
 *   sportsCarLicenseClass: "B",
 *   // ... other disciplines
 * });
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

/**
 * Schema for structured license discipline data
 *
 * Validates the final format of license data as presented to the client.
 * This structure organizes license information by racing discipline with
 * user-friendly field names and nullable values for incomplete data.
 *
 * Categories represent the five main racing disciplines in iRacing:
 * - Oval: Traditional oval track racing
 * - Sports: Sports car racing on road courses
 * - Formula: Open-wheel formula car racing
 * - Dirt Oval: Dirt track oval racing
 * - Dirt Road: Dirt track road course racing
 *
 * @example
 * ```typescript
 * const discipline = LicenseDisciplineSchema.parse({
 *   category: "Oval",
 *   iRating: 2500,
 *   safetyRating: "3.45",
 *   licenseClass: "A"
 * });
 * ```
 */
export const LicenseDisciplineSchema = z.object({
  category: z.enum(["Oval", "Sports", "Formula", "Dirt Oval", "Dirt Road"]),
  iRating: z.number().nullable(),
  safetyRating: z.string().nullable(),
  licenseClass: LicenseClassSchema,
});

/**
 * Type definition for database query result
 *
 * Represents the structure of data returned from the database query that
 * joins user, profile, and license tables. Used as input for building
 * the final user profile structure.
 */
export type TransformLicensesInput = {
  user: UserTable | null;
  profile: ProfileTable | null;
  licenses: LicenseTable | null;
};
