import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

export type AuthorizedUser = {
  id: string;
  role: "admin" | "staff" | "user" | "guest";
};

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
 * Validates if the current user has permission to modify the target user
 */
export async function validateUserModificationPermissions(
  currentUser: AuthorizedUser,
  targetUserId: string,
  operation: "edit" | "delete",
): Promise<void> {
  const targetUser = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, targetUserId))
    .then((row) => row[0]);

  if (!targetUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Target user not found",
    });
  }

  // Staff cannot modify admin or other staff users
  const isUnauthorizedStaffAction =
    currentUser.role === "staff" &&
    (targetUser.role === "admin" || targetUser.role === "staff");

  if (isUnauthorizedStaffAction) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only an admin can modify staff or admin users",
    });
  }

  // Users cannot delete themselves
  if (operation === "delete" && currentUser.id === targetUserId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot delete your own account",
    });
  }

  // Admins cannot be deleted by anyone
  if (operation === "delete" && targetUser.role === "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin accounts cannot be deleted",
    });
  }
}

/**
 * Updates user profile information (team and active status)
 */
export async function updateUserProfile(
  userId: string,
  updates: { team?: string | null; isActive?: boolean },
): Promise<void> {
  const [result] = await db
    .update(profileTable)
    .set(updates)
    .where(eq(profileTable.userId, userId));

  if (result.affectedRows === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update user profile",
    });
  }
}

/**
 * Updates user role information
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "staff" | "user" | "guest",
): Promise<void> {
  const [result] = await db
    .update(user)
    .set({ role })
    .where(eq(user.id, userId));

  if (result.affectedRows === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update user role",
    });
  }
}

/**
 * Fetches a single user with their profile information
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