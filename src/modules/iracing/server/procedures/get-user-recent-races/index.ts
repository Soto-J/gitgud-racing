import { iracingProcedure } from "@/trpc/init";

import { fetchData } from "@/modules/iracing/server/api";

import {
  IRacingGetUserRecentRacesInputSchema,
  IRacingGetUserRecentRacesResponseSchema,
} from "@/modules/iracing/server/procedures/get-user-recent-races/schema";

/**
 * Fetches recent race data for a user from iRacing
 */
export const getUserRecentRacesProcedure = iracingProcedure
  .input(IRacingGetUserRecentRacesInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    const res = await fetchData({
      query: `/data/stats/member_recent_races?cust_id=${input.custId}`,
      authCode: ctx.iracingAuthCode,
    });

    const recentRaces = IRacingGetUserRecentRacesResponseSchema.parse(res);

    return recentRaces || null;
  });
