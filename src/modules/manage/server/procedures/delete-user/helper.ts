import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { user } from "@/db/schemas";

export type AuthorizedUser = {
  id: string;
  role: "admin" | "staff" | "user" | "guest";
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
 * Deletes a user from the system
 *
 * @param userId - The user ID to delete
 * @returns The deletion result
 * @throws TRPCError if user cannot be found or deleted
 */
export async function deleteUser(userId: string) {
  // Verify user exists before attempting deletion
  const [memberToDelete] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, userId));

  if (!memberToDelete) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  const [result] = await db.delete(user).where(eq(user.id, userId));

  return result;
}