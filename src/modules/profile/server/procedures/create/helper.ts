import { and, eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

/**
 * Fetches profile with user information for join queries
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

/**
 * Creates a new profile for a user
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