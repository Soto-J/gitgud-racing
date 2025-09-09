import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { UpdateProfileInputSchema } from "./schema";
import {  updateUserProfile } from "./helper";

/**
 * Updates profile information for the authenticated user
 */
export const updateProfileProcedure = protectedProcedure
  .input(UpdateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      await updateUserProfile(input.userId, ctx.auth.user.id, {
        firstName: input.firstName,
        lastName: input.lastName,
        iRacingId: input.iRacingId,
        discord: input.discord,
        bio: input.bio,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update profile",
      });
    }
  });
