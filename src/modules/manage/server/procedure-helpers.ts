import { eq, like, and, count, desc } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user } from "@/db/schema";

// =============================================================================
// TYPES
// =============================================================================

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

export type AuthorizedUser = {
  id: string;
  role: "admin" | "staff" | "member";
};

// =============================================================================
// DATABASE QUERY HELPERS
// =============================================================================

/**
 * Fetches a single user with their profile information
 * 
 * @param userId - The user ID to fetch
 * @returns Promise resolving to user with profile data
 * @throws TRPCError if user is not found
 * 
 * @example
 * ```typescript
 * const user = await getUserWithProfile("user_123");
 * console.log(user.name, user.team, user.isActive);
 * ```
 */
export async function getUserWithProfile(userId: string): Promise<UserWithProfile> {
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
      message: "User not found" 
    });
  }

  return member;
}

/**
 * Fetches multiple users with their profile information using pagination and filtering
 * 
 * @param filters - Object containing search and pagination parameters
 * @returns Promise resolving to paginated user list with metadata
 * 
 * @example
 * ```typescript
 * const result = await getUsersWithProfiles({
 *   search: "john",
 *   page: 1,
 *   pageSize: 10,
 *   memberId: "user_123"
 * });
 * console.log(result.members, result.total, result.totalPages);
 * ```
 */
export async function getUsersWithProfiles(filters: {
  memberId?: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const { memberId, search, page, pageSize } = filters;
  
  const searchClause = buildUserSearchClause(memberId, search);

  const members = await db
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
    .where(searchClause)
    .orderBy(desc(user.createdAt), desc(user.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  if (!members?.length) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "No users found" 
    });
  }

  const [total] = await db
    .select({ count: count() })
    .from(user)
    .innerJoin(profileTable, eq(profileTable.userId, user.id))
    .where(searchClause);

  const totalPages = Math.ceil(total.count / pageSize);

  return {
    members,
    total: total.count,
    totalPages,
  };
}

/**
 * Builds search clause for user filtering by ID and name
 */
function buildUserSearchClause(memberId?: string, search?: string) {
  return and(
    memberId ? eq(user.id, memberId) : undefined,
    search ? like(user.name, `%${search}%`) : undefined,
  );
}

// =============================================================================
// AUTHORIZATION HELPERS
// =============================================================================

/**
 * Validates if the current user has permission to modify the target user
 * 
 * Staff users cannot modify admin or other staff users
 * Users cannot modify themselves in delete operations
 * 
 * @param currentUser - The authenticated user making the request
 * @param targetUserId - The user being modified
 * @param operation - The type of operation being performed
 * @throws TRPCError if operation is not authorized
 * 
 * @example
 * ```typescript
 * await validateUserModificationPermissions(
 *   { id: "staff_123", role: "staff" },
 *   "admin_456",
 *   "edit"
 * );
 * ```
 */
export async function validateUserModificationPermissions(
  currentUser: AuthorizedUser,
  targetUserId: string,
  operation: 'edit' | 'delete'
): Promise<void> {
  const targetUser = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, targetUserId))
    .then((val) => val[0]);

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
  if (operation === 'delete' && currentUser.id === targetUserId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot delete your own account",
    });
  }

  // Admins cannot be deleted by anyone
  if (operation === 'delete' && targetUser.role === "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin accounts cannot be deleted",
    });
  }
}

// =============================================================================
// UPDATE OPERATIONS
// =============================================================================

/**
 * Updates user profile information (team and active status)
 * 
 * @param userId - The user ID to update
 * @param updates - The profile updates to apply
 * @throws TRPCError if update fails
 */
export async function updateUserProfile(
  userId: string,
  updates: { team?: string | null; isActive?: boolean }
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
 * 
 * @param userId - The user ID to update
 * @param role - The new role to assign
 * @throws TRPCError if update fails
 */
export async function updateUserRole(
  userId: string,
  role: "admin" | "staff" | "member"
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

  const [result] = await db
    .delete(user)
    .where(eq(user.id, userId));

  return result;
}