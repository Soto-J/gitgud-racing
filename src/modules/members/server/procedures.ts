import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import {
  getMemberWithProfile,
  getMembersWithProfiles,
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
const getOneProcedure = protectedProcedure
  .input(GetMemberInputSchema)
  .query(async ({ input }) => {
    return await getMemberWithProfile(input.id);
  });

/**
 * Fetches multiple members with pagination and search functionality
 * Includes statistics for total members and active members
 */
const getManyProcedure = protectedProcedure
  .input(GetMembersInputSchema)
  .query(async ({ input }) => {
    const { memberId, page, pageSize, search } = input;

    return await getMembersWithProfiles({
      memberId: memberId || undefined,
      search: search || undefined,
      page,
      pageSize,
    });
  });

export const membersRouter = createTRPCRouter({
  getOne: getOneProcedure,
  getMany: getManyProcedure,
});
