import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/trpc/init";

import { CreateProfileInputSchema } from "./schema";
import { createUserProfile } from "./helper";

/**
 * Creates a new profile for the authenticated user
 */
export const createProfileProcedure = protectedProcedure
  .input(CreateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      return await createUserProfile(input.userId, ctx.auth.user.id);
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create profile",
      });
    }
  });