import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";
import { ProfileUpdateData } from "./types";

/**
 * Updates profile and user information
 */
export async function updateUserProfile(
  userId: string,
  currentUserId: string,
  updates: ProfileUpdateData,
) {
  const [result] = await db
    .update(profileTable)
    .set({
      discord: updates.discord.trim(),
      bio: updates.bio.trim(),
    })
    .where(eq(profileTable.userId, userId));

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
