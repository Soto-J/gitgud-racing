import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { manageProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, user } from "@/db/schemas";

import { UpdateUserInputSchema } from "./schema";

/**
 * Updates user profile and role information (admin/staff only)
 */
export const updateUserProcedure = manageProcedure
  .input(UpdateUserInputSchema)
  .mutation(async ({ input }) => {
    const { userId, role, team, isActive } = input;

    const userToUpdate = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.userId, userId));

    if (!userToUpdate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User to update not found",
      });
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(profileTable)
          .set({ team, isActive })
          .where(eq(profileTable.userId, input.userId));

        await tx.update(user).set({ role }).where(eq(user.id, userId));
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(error);
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }
  });
