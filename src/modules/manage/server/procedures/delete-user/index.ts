import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { user } from "@/db/schemas";

import { DeleteUserInputSchema } from "./schema";
import { manageProcedure } from "@/trpc/init/manage-procedure";

/**
 * Permanently deletes a user from the system (admin/staff only)
 */
export const deleteUserProcedure = manageProcedure
  .input(DeleteUserInputSchema)
  .mutation(async ({ ctx, input }) => {
    if (ctx.auth.user.id === input.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Cannot delete your own account.",
      });
    }

    const userToDelete = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, input.userId))
      .then((row) => row[0]);

    if (!userToDelete) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User to delete not found.",
      });
    }

    try {
      await db.delete(user).where(eq(user.id, input.userId));
      console.log(`User ${input.userId} deleted by ${ctx.auth.user.id}`);
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
