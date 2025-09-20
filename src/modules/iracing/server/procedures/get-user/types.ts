import { z } from "zod";

import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

import {
  LicenseClassSchema,
  LicenseDisciplineSchema,
  LicenseSchema,
  TransformLicenseDataSchema,
  UserResponseSchema,
} from "./schema";

// =============================================================================
// PROCEDURE OUTPUT TYPES
// =============================================================================

/**
 * Complete user data type as returned by the getUserProcedure
 *
 * This type represents the final structure returned by the tRPC procedure,
 * including user information, profile data, and organized license disciplines.
 * It's inferred from the actual router output to ensure type safety.
 *
 * Structure includes:
 * - user: Basic user information (id, name, email, etc.)
 * - profile: User profile data (iRacing ID, Discord, bio, etc.)
 * - licenses: Organized license data with disciplines array
 *
 * @example
 * ```typescript
 * const userData: UserData = await trpc.iracing.getUser.query({ userId: "123" });
 * console.log(userData.user.name);
 * console.log(userData.licenses.disciplines[0].iRating);
 * ```
 */
export type UserData = inferRouterOutputs<AppRouter>["iracing"]["getUser"];

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

/**
 * Type for complete iRacing API response
 *
 * Represents the validated structure of the response from iRacing's
 * `/data/member/get` endpoint. Used for API data validation and
 * type safety when processing external data.
 */
export type UserResponse = z.infer<typeof UserResponseSchema>;

/**
 * Type for individual license data from iRacing API
 *
 * Represents a single license object as returned by iRacing's API.
 * Contains raw data for one racing discipline including ratings,
 * safety data, and classification information.
 */
export type LicenseType = z.infer<typeof LicenseSchema>;

// =============================================================================
// LICENSE DATA TYPES
// =============================================================================

/**
 * Type for iRacing license classes
 *
 * Represents the possible license classes in iRacing's progression system:
 * - "A": Class A (highest license class)
 * - "B": Class B
 * - "C": Class C
 * - "D": Class D
 * - "R": Rookie (entry level)
 */
export type LicenseClass = z.infer<typeof LicenseClassSchema>;

/**
 * Type for structured license discipline data
 *
 * Represents license information for a single racing discipline in the
 * client-facing format. Used in the final user profile structure to
 * provide organized license data per racing category.
 *
 * @example
 * ```typescript
 * const ovalLicense: LicenseDiscipline = {
 *   category: "Oval",
 *   iRating: 2500,
 *   safetyRating: "3.45",
 *   licenseClass: "A"
 * };
 * ```
 */
export type LicenseDiscipline = z.infer<typeof LicenseDisciplineSchema>;

/**
 * Type for database-formatted license data
 *
 * Represents the flattened license data structure used for database storage.
 * Contains separate fields for each racing discipline's iRating, safety rating,
 * and license class. This format enables efficient database queries and updates.
 *
 * @example
 * ```typescript
 * const dbLicenseData: TransformLicenseData = {
 *   ovalIRating: 2500,
 *   ovalSafetyRating: "3.45",
 *   ovalLicenseClass: "A",
 *   sportsCarIRating: 1800,
 *   sportsCarSafetyRating: "2.85",
 *   sportsCarLicenseClass: "B",
 *   // ... other disciplines
 * };
 * ```
 */
export type TransformLicenseData = z.infer<typeof TransformLicenseDataSchema>;
