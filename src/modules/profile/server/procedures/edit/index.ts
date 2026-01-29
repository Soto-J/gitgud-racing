import { eq } from "drizzle-orm";

import { protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { profileTable, user as userTable } from "@/db/schemas";
import { ProfileSchema } from "./types/schema";

export const editProfileProcedure = protectedProcedure
  .input(ProfileSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.auth.user.id;

    return db.transaction(async (tx) => {
      const [emailResult] = await tx
        .update(userTable)
        .set({ email: input.email })
        .where(eq(userTable.id, userId));

      if (emailResult.affectedRows === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const [profileResult] = await tx
        .update(profileTable)
        .set({
          discord: input.discord?.trim() || null,
          bio: input.bio?.trim() || null,
        })
        .where(eq(profileTable.userId, userId));

      if (profileResult.affectedRows === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return {
        success: true,
      };
    });
  });
