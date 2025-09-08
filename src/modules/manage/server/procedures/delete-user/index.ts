import { TRPCError } from "@trpc/server";
import { manageProcedure } from "@/trpc/init";

import { DeleteUserInputSchema } from "./schema";
import { validateUserModificationPermissions, deleteUser } from "./helper";

/**
 * Permanently deletes a user from the system (admin/staff only)
 */
export const deleteUserProcedure = manageProcedure
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
      "delete",
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