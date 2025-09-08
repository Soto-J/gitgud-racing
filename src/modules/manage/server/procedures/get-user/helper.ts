import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

export type UserWithProfile = {
  id: string;
  name: string;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  team: string | null;
  isActive: boolean;
};

/**
 * Fetches a single user with their profile information
 *
 * @param userId - The user ID to fetch
 * @returns Promise resolving to user with profile data
 * @throws TRPCError if user is not found
 */
export async function getUserWithProfile(
  userId: string,
): Promise<UserWithProfile> {
  const [member] = await db
    .select({
      id: user.id,
      name: user.name,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      team: profileTable.team,
      isActive: profileTable.isActive,
    })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(eq(profileTable.userId, userId));

  if (!member) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return member;
}