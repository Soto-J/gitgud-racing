import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

import { ProfileUpdateData } from "./schema";

/**
 * Validates profile data before processing
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

/**
 * Updates profile and user information
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