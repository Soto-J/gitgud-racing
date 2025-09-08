import { TRPCError } from "@trpc/server";
import { manageProcedure } from "@/trpc/init";

import { UpdateUserInputSchema } from "./schema";
import {
  validateUserModificationPermissions,
  updateUserProfile,
  updateUserRole,
  getUserWithProfile,
} from "./helper";

/**
 * Updates user profile and role information (admin/staff only)
 */
export const updateUserProcedure = manageProcedure
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
      "edit",
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