import { TRPCError } from "@trpc/server";
import { createTRPCRouter, manageProcedure } from "@/trpc/init";

import {
  getUserWithProfile,
  getUsersWithProfiles,
  validateUserModificationPermissions,
  updateUserProfile,
  updateUserRole,
  deleteUser,
} from "./procedure-helpers";

import {
  DeleteUserInputSchema,
  GetUserInputSchema,
  GetUsersInputSchema,
  UpdateUserInputSchema,
} from "@/modules/manage/schema";

// =============================================================================
// USER QUERY PROCEDURES
// =============================================================================

/**
 * Fetches a single user with their profile information for management purposes
 */
const getUserProcedure = manageProcedure
  .input(GetUserInputSchema)
  .query(async ({ input }) => {
    return await getUserWithProfile(input.userId);
  });

/**
 * Fetches multiple users with pagination and search functionality for management
 */
const getUsersProcedure = manageProcedure
  .input(GetUsersInputSchema)
  .query(async ({ input }) => {
    const { memberId, search, pageSize, page } = input;
    
    return await getUsersWithProfiles({
      memberId: memberId || undefined,
      search: search || undefined,
      page,
      pageSize,
    });
  });

// =============================================================================
// USER MANAGEMENT PROCEDURES
// =============================================================================

/**
 * Updates user profile and role information (admin/staff only)
 */
const updateUserProcedure = manageProcedure
  .input(UpdateUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    const currentUser = {
      id: ctx.auth.user.id,
      role: ctx.auth.user.role as "admin" | "staff" | "user" | "guest",
    };

    // Validate permissions before making any changes
    await validateUserModificationPermissions(
      currentUser,
      input.userId,
      'edit'
    );

    try {
      // Update profile information
      await updateUserProfile(input.userId, {
        team: input.team,
        isActive: input.isActive,
      });

      // Update role information
      await updateUserRole(input.userId, input.role);

      // Return updated user data
      return await getUserWithProfile(input.userId);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }
  });

/**
 * Permanently deletes a user from the system (admin/staff only)
 */
const deleteUserProcedure = manageProcedure
  .input(DeleteUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    const currentUser = {
      id: ctx.auth.user.id,
      role: ctx.auth.user.role as "admin" | "staff" | "user" | "guest",
    };

    // Validate permissions and business rules
    await validateUserModificationPermissions(
      currentUser,
      input.userId,
      'delete'
    );

    try {
      return await deleteUser(input.userId);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete user",
      });
    }
  });

// =============================================================================
// ROUTER EXPORT
// =============================================================================

export const manageRouter = createTRPCRouter({
  // User query procedures
  getUser: getUserProcedure,
  getUsers: getUsersProcedure,

  // User management procedures  
  editUser: updateUserProcedure,
  deleteUser: deleteUserProcedure,
});