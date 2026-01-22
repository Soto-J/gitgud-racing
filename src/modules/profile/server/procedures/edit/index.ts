import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { ProfileUpdateSchema } from "./types/schema";
import { updateUserProfile } from "./utilities";

/**
 * Updates profile information for the authenticated user
 */
export const editProfileProcedure = protectedProcedure
  .input(ProfileUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      await updateUserProfile(input.userId, ctx.auth.user.id, {
        firstName: input.firstName,
        lastName: input.lastName,
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
