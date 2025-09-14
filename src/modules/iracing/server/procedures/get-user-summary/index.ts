/**
 * @fileoverview User summary tRPC procedure for fetching iRacing member statistics
 *
 * This module implements the procedure for retrieving current year statistics
 * for authenticated users, including session participation and win counts.
 */

import { eq } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";

import { GetUserSummaryResponse } from "@/modules/iracing/server/procedures/get-user-summary/schema";

/**
 * Fetches current year summary statistics for the authenticated user
 *
 * Retrieves comprehensive statistics from iRacing including:
 * - Official and league session participation counts
 * - Win counts for both official races and league events
 * - All data scoped to the current calendar year
 *
 * Requires user authentication and a linked iRacing profile.
 *
 * @returns User summary statistics or null if user has no iRacing profile
 *
 * @example
 * ```typescript
 * // Frontend usage (requires authentication)
 * const { data: summary } = trpc.iracing.getUserSummary.useQuery();
 *
 * if (summary) {
 *   console.log(`Sessions: ${summary.this_year.num_official_sessions}`);
 *   console.log(`Wins: ${summary.this_year.num_official_wins}`);
 * }
 * ```
 */
export const getUserSummaryProcedure = iracingProcedure.query(
  async ({ ctx }) => {
    // Get authenticated user's iRacing customer ID
    const userProfile = await db
      .select({ custId: profileTable.iracingId })
      .from(profileTable)
      .where(eq(profileTable.userId, ctx.auth.user.id))
      .then((row) => row[0]);

    if (!userProfile?.custId) {
      return null;
    }

    // Fetch current year statistics from iRacing API
    const res = await fetchData({
      query: `/data/stats/member_summary?cust_id=${userProfile.custId}`,
      authCode: ctx.iracingAuthCode,
    });

    // Validate and parse the API response
    const userSummary = GetUserSummaryResponse.parse(res);

    return userSummary || null;
  },
);
