import { and, eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { licenseTable, profileTable, user } from "@/db/schemas";

// =============================================================================
// TYPES
// =============================================================================

export type ProfileWithUserAndLicenses = {
  id: string | null;
  userId: string | null;
  iracingId: string | null;
  discord: string | null;
  team: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  memberName: string;
  // License fields (nullable if no licenses exist)
  ovalIRating?: number | null;
  ovalSafetyRating?: string | null;
  ovalLicenseClass?: string | null;
  sportsCarIRating?: number | null;
  sportsCarSafetyRating?: string | null;
  sportsCarLicenseClass?: string | null;
  formulaCarIRating?: number | null;
  formulaCarSafetyRating?: string | null;
  formulaCarLicenseClass?: string | null;
  dirtOvalIRating?: number | null;
  dirtOvalSafetyRating?: string | null;
  dirtOvalLicenseClass?: string | null;
  dirtRoadIRating?: number | null;
  dirtRoadSafetyRating?: string | null;
  dirtRoadLicenseClass?: string | null;
};

export type ProfileUpdateData = {
  iRacingId: string;
  discord: string;
  bio: string;
  firstName: string;
  lastName: string;
};

// =============================================================================
// DATABASE QUERY HELPERS
// =============================================================================

/**
 * Fetches a complete profile with user information and license data
 *
 * @param userId - The user ID to fetch profile for
 * @returns Promise resolving to complete profile data
 * @throws TRPCError if profile is not found
 *
 * @example
 * ```typescript
 * const profile = await getCompleteProfile("user_123");
 * console.log(profile.memberName, profile.team, profile.ovalIRating);
 * ```
 */
export async function getCompleteProfile(
  userId: string,
): Promise<ProfileWithUserAndLicenses> {
  const profileWithUser = await db
    .select({
      ...getTableColumns(profileTable),
      ...getTableColumns(licenseTable),
      memberName: user.name,
    })
    .from(profileTable)
    .innerJoin(user, eq(user.id, profileTable.userId))
    .leftJoin(licenseTable, eq(licenseTable.userId, profileTable.userId))
    .where(eq(profileTable.userId, userId))
    .then((row) => row[0]);

  if (!profileWithUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Profile not found for user: ${userId}`,
    });
  }

  return profileWithUser;
}

/**
 * Fetches all profiles from the database
 *
 * @returns Promise resolving to array of all profiles
 */
export async function getAllProfiles() {
  return await db.select().from(profileTable);
}

/**
 * Fetches profile with user information for join queries
 *
 * @param userId - The user ID to fetch profile for
 * @param currentUserId - The ID of the user making the request (for authorization)
 * @returns Promise resolving to profile with user data
 * @throws TRPCError if profile is not found or unauthorized
 */
export async function getProfileWithUser(
  userId: string,
  currentUserId: string,
) {
  const [profile] = await db
    .select()
    .from(profileTable)
    .innerJoin(user, eq(user.id, profileTable.userId))
    .where(
      and(
        eq(profileTable.userId, userId),
        eq(profileTable.userId, currentUserId), // Authorization check
      ),
    );

  if (!profile) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to access this profile",
    });
  }

  return profile;
}

// =============================================================================
// PROFILE MANAGEMENT HELPERS
// =============================================================================

/**
 * Creates a new profile for a user
 *
 * @param userId - The user ID to create profile for
 * @param currentUserId - The ID of the user making the request (for authorization)
 * @returns Promise resolving to the created profile with user data
 * @throws TRPCError if creation fails or unauthorized
 */
export async function createUserProfile(userId: string, currentUserId: string) {
  const [response] = await db.insert(profileTable).values({
    userId: userId,
  });

  if (!response) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create profile",
    });
  }

  // Return the created profile with user information
  return await getProfileWithUser(userId, currentUserId);
}

/**
 * Updates profile and user information
 *
 * @param userId - The user ID whose profile to update
 * @param currentUserId - The ID of the user making the request (for authorization)
 * @param updates - The profile updates to apply
 * @returns Promise resolving to the updated profile
 * @throws TRPCError if update fails or unauthorized
 */
export async function updateUserProfile(
  userId: string,
  currentUserId: string,
  updates: ProfileUpdateData,
) {
  // Validate authorization
  const isAuthorized = userId === currentUserId;
  if (!isAuthorized) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authorized to update this profile",
    });
  }

  // Update profile information
  const result = await db
    .update(profileTable)
    .set({
      iracingId: updates.iRacingId.trim(),
      discord: updates.discord.trim(),
      bio: updates.bio.trim(),
    })
    .where(eq(profileTable.userId, userId))
    .then((row) => row[0]);

  if (!result || result.affectedRows === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update profile",
    });
  }

  // Update user name
  const fullName = `${updates.firstName.trim()} ${updates.lastName.trim()}`;
  await db
    .update(user)
    .set({ name: fullName })
    .where(eq(user.id, currentUserId));

  // Return updated profile
  const [editedProfile] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, userId));

  return editedProfile;
}

/**
 * Validates profile data before processing
 *
 * @param data - The profile data to validate
 * @throws TRPCError if validation fails
 */
export function validateProfileData(data: ProfileUpdateData): void {
  if (!data.firstName?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "First name is required",
    });
  }

  if (!data.lastName?.trim()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Last name is required",
    });
  }

  // Validate iRacing ID format if provided
  if (data.iRacingId && !/^\d+$/.test(data.iRacingId.trim())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "iRacing ID must be numeric",
    });
  }
}
