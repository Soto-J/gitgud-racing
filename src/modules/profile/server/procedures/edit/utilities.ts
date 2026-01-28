import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable } from "@/db/schemas";
import type { ProfileUpdateData } from "./types";

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

  const [editedProfile] = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.userId, userId));

  return editedProfile;
}
