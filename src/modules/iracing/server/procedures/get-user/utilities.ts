import { getTableColumns, eq } from "drizzle-orm";

import { db } from "@/db";
import { licenseTable, user, profileTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";

import {
  UserResponseSchema,
  TransformLicensesInput,
} from "@/modules/iracing/server/procedures/get-user/schema";

import type {
  LicenseDiscipline,
  LicenseType,
  TransformLicenseData,
} from "./types";

/**
 * Builds a complete user profile from database components
 *
 * This function takes the flat database result (user, profile, and licenses)
 * and assembles it into a structured user profile object with organized
 * license disciplines. It handles cases where license data may be missing
 * or incomplete.
 *
 * @param member - Database result including user, profile, and license information
 *
 * @returns Complete user profile with structured license disciplines
 *
 * @example
 * ```typescript
 * const dbResult = {
 *   user: { id: "123", name: "John" },
 *   profile: { iracingId: "958942" },
 *   licenses: {
 *     ovalIRating: 2500,
 *     ovalSafetyRating: "3.45",
 *     ovalLicenseClass: "A",
 *     // ... other license data
 *   }
 * };
 *
 * const userProfile = buildUserProfile(dbResult);
 * console.log(userProfile.licenses.disciplines[0]);
 * // { category: "Oval", iRating: 2500, safetyRating: "3.45", licenseClass: "A" }
 * ```
 */
export const buildUserProfile = (member: TransformLicensesInput) => {
  if (!member?.licenses) {
    return {
      ...member,
      licenses: {
        id: null,
        createdAt: null,
        updatedAt: null,
        disciplines: [],
      },
    };
  }

  const licenseData = member.licenses;

  // Create an array of license objects
  const disciplinesArray: LicenseDiscipline[] = [
    {
      category: "Oval",
      iRating: licenseData.ovalIRating,
      safetyRating: licenseData.ovalSafetyRating,
      licenseClass: licenseData.ovalLicenseClass,
    },
    {
      category: "Sports",
      iRating: licenseData.sportsCarIRating,
      safetyRating: licenseData.sportsCarSafetyRating,
      licenseClass: licenseData.sportsCarLicenseClass,
    },
    {
      category: "Formula",
      iRating: licenseData.formulaCarIRating,
      safetyRating: licenseData.formulaCarSafetyRating,
      licenseClass: licenseData.formulaCarLicenseClass,
    },
    {
      category: "Dirt Oval",
      iRating: licenseData.dirtOvalIRating,
      safetyRating: licenseData.dirtOvalSafetyRating,
      licenseClass: licenseData.dirtOvalLicenseClass,
    },
    {
      category: "Dirt Road",
      iRating: licenseData.dirtRoadIRating,
      safetyRating: licenseData.dirtRoadSafetyRating,
      licenseClass: licenseData.dirtRoadLicenseClass,
    },
  ];

  // Excluding the old licenses field
  const { licenses, ...userAndProfile } = member;

  return {
    ...userAndProfile,
    licenses: {
      id: licenses.id,
      createdAt: licenses.createdAt,
      updatedAt: licenses.updatedAt,
      disciplines: disciplinesArray,
    },
  };
};

/**
 * Synchronizes user license data from iRacing API to database
 *
 * This function fetches the latest license information for a specific user
 * from iRacing's API and updates the database with the fresh data. It's
 * designed to be called when license data is stale or missing.
 *
 * The function handles:
 * - API data fetching and validation
 * - Data transformation from API format to database format
 * - Upsert operation to avoid duplicate entries
 * - Graceful handling of missing or invalid license data
 *
 * @param custId - iRacing customer ID to fetch data for
 * @param userId - Internal user ID for database storage
 * @param authCode - iRacing authentication code for API access
 *
 * @returns Promise that resolves when sync is complete
 *
 * @example
 * ```typescript
 * await syncUserLicenseData("958942", "user_123", "auth_token_xyz");
 * console.log("License data synchronized successfully");
 * ```
 *
 * @throws Will throw if API request fails or data validation fails
 */
export async function syncUserLicenseData(
  custId: string,
  userId: string,
  authCode: string,
): Promise<void> {
  const res = await fetchData({
    query: `/data/member/get?cust_ids=${custId}&include_licenses=true`,
    authCode,
  });

  const iRacingUserData = UserResponseSchema.parse(res);

  if (!iRacingUserData?.members?.[0]?.licenses) {
    return;
  }

  const apiLicenses = iRacingUserData.members[0].licenses;
  const transformedData = mapLicenseTypesToDb(apiLicenses);

  await db
    .insert(licenseTable)
    .values({
      ...transformedData,
      userId,
    })
    .onDuplicateKeyUpdate({
      set: { ...transformedData },
    });
}

/**
 * Maps iRacing API license data to database format
 *
 * This function transforms the license data received from iRacing's API
 * into the flat structure required for database storage. It handles
 * category mapping from iRacing's naming convention to the database
 * field naming and normalizes license classes.
 *
 * @param licenses - Array of license data from iRacing API
 *
 * @returns Database-formatted license object with all disciplines
 *
 * @example
 * ```typescript
 * const iracingLicenses = [
 *   {
 *     category: "oval",
 *     irating: 2500,
 *     safety_rating: 3.45,
 *     group_name: "Class A"
 *   },
 *   // ... other licenses
 * ];
 *
 * const dbData = mapLicenseTypesToDb(iracingLicenses);
 * console.log(dbData);
 * // {
 * //   ovalIRating: 2500,
 * //   ovalSafetyRating: "3.45",
 * //   ovalLicenseClass: "A",
 * //   // ... other disciplines
 * // }
 * ```
 */
export const mapLicenseTypesToDb = (
  licenses: LicenseType[],
): TransformLicenseData => {
  const categoryMap = {
    oval: "oval",
    sports_car: "sportsCar",
    formula_car: "formulaCar",
    dirt_oval: "dirtOval",
    dirt_road: "dirtRoad",
  } as const;

  // Ensure only return valid license classes
  const normalizeClass = (cls: string): "A" | "B" | "C" | "D" | "R" => {
    if (cls === "Rookie") return "R";

    if (["A", "B", "C", "D", "R"].includes(cls)) {
      return cls as "A" | "B" | "C" | "D" | "R";
    }

    return "R";
  };

  // Initialize with default values for all categories
  const defaultLicenseData = {
    ovalIRating: 1350,
    ovalSafetyRating: "2.50",
    ovalLicenseClass: "R" as const,
    sportsCarIRating: 1350,
    sportsCarSafetyRating: "2.50",
    sportsCarLicenseClass: "R" as const,
    formulaCarIRating: 1350,
    formulaCarSafetyRating: "2.50",
    formulaCarLicenseClass: "R" as const,
    dirtOvalIRating: 1350,
    dirtOvalSafetyRating: "2.50",
    dirtOvalLicenseClass: "R" as const,
    dirtRoadIRating: 1350,
    dirtRoadSafetyRating: "2.50",
    dirtRoadLicenseClass: "R" as const,
  };

  const result = licenses.reduce((acc, license) => {
    const category = categoryMap[license.category as keyof typeof categoryMap];

    if (!category) return acc;

    const licenseClass = license.group_name.replace("Class ", "").trim();
    const normalizedClass = licenseClass === "Rookie" ? "R" : licenseClass;

    return {
      ...acc,
      [`${category}IRating`]: license.irating || 1350, // Use 1350 if no irating
      [`${category}SafetyRating`]: license.safety_rating.toFixed(2),
      [`${category}LicenseClass`]: normalizeClass(normalizedClass),
    };
  }, defaultLicenseData as TransformLicenseData);

  return result;
};

/**
 * Fetches complete user data with joined profile and license information
 *
 * This function performs a standardized query to get user data along with
 * their profile and license information from the database. It's used both
 * for initial data retrieval and after syncing fresh data from iRacing.
 *
 * @param userId - The user ID to fetch data for
 *
 * @returns Promise resolving to user data with profile and licenses, or undefined if not found
 *
 * @example
 * ```typescript
 * const userData = await getUserWithLicenses("user_123");
 * if (userData?.user) {
 *   console.log(userData.user.name);
 *   console.log(userData.licenses?.ovalIRating);
 * }
 * ```
 */
export const getUserWithLicenses = async (userId: string) => {
  return await db
    .select({
      user: { ...getTableColumns(user) },
      profile: { ...getTableColumns(profileTable) },
      licenses: { ...getTableColumns(licenseTable) },
    })
    .from(user)
    .leftJoin(profileTable, eq(profileTable.userId, user.id))
    .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
    .where(eq(user.id, userId))
    .then((rows) => rows[0]);
};
