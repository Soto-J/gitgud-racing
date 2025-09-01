import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import {
  getCompleteProfile,
  getAllProfiles,
  createUserProfile,
  updateUserProfile,
  validateProfileData,
} from "./procedure-helpers";

import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  GetProfileInputSchema,
} from "@/modules/profile/schema";

// =============================================================================
// PROFILE QUERY PROCEDURES
// =============================================================================

/**
 * Fetches a complete profile with user and license information
 */
const getProfileProcedure = protectedProcedure
  .input(GetProfileInputSchema)
  .query(async ({ input }) => {
    return await getCompleteProfile(input.userId);
  });

/**
 * Fetches all user profiles (admin/staff functionality)
 */
const getAllProfilesProcedure = protectedProcedure.query(async () => {
  return await getAllProfiles();
});

// =============================================================================
// PROFILE MANAGEMENT PROCEDURES
// =============================================================================

/**
 * Creates a new profile for the authenticated user
 */
const createProfileProcedure = protectedProcedure
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

/**
 * Updates profile information for the authenticated user
 */
const updateProfileProcedure = protectedProcedure
  .input(UpdateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    // Validate input data
    validateProfileData({
      firstName: input.firstName,
      lastName: input.lastName,
      iRacingId: input.iRacingId,
      discord: input.discord,
      bio: input.bio,
    });

    try {
      return await updateUserProfile(
        input.userId,
        ctx.auth.user.id,
        {
          firstName: input.firstName,
          lastName: input.lastName,
          iRacingId: input.iRacingId,
          discord: input.discord,
          bio: input.bio,
        }
      );
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

// =============================================================================
// ROUTER EXPORT
// =============================================================================

export const profileRouter = createTRPCRouter({
  // Profile query procedures
  getOne: getProfileProcedure,
  getMany: getAllProfilesProcedure,

  // Profile management procedures
  create: createProfileProcedure,
  edit: updateProfileProcedure,
});