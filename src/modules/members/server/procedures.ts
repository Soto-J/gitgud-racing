import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import {
  getMemberWithProfile,
  getMembersWithProfiles,
  validateMemberSearchFilters,
} from "./procedure-helpers";

import {
  GetMembersInputSchema,
  GetMemberInputSchema,
} from "@/modules/members/schema";

// =============================================================================
// MEMBER QUERY PROCEDURES
// =============================================================================

/**
 * Fetches a single member with their profile information
 */
const getMemberProcedure = protectedProcedure
  .input(GetMemberInputSchema)
  .query(async ({ input }) => {
    return await getMemberWithProfile(input.id);
  });

/**
 * Fetches multiple members with pagination and search functionality
 * Includes statistics for total members and active members
 */
const getMembersProcedure = protectedProcedure
  .input(GetMembersInputSchema)
  .query(async ({ input }) => {
    const { memberId, page, pageSize, search } = input;

    // Validate search parameters
    validateMemberSearchFilters({
      memberId: memberId || undefined,
      search: search || undefined,
      page,
      pageSize,
    });

    try {
      return await getMembersWithProfiles({
        memberId: memberId || undefined,
        search: search || undefined,
        page,
        pageSize,
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch members",
      });
    }
  });

// =============================================================================
// ROUTER EXPORT
// =============================================================================

export const membersRouter = createTRPCRouter({
  // Member query procedures
  getOne: getMemberProcedure,
  getMany: getMembersProcedure,
});