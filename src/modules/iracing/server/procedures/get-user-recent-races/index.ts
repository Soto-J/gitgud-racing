import { iracingProcedure } from "@/trpc/init";

import { IRacingGetUserRecentRacesInputSchema } from "@/modules/iracing/schema";
import { fetchData } from "@/modules/iracing/server/api";

/**
 * Fetches recent race data for a user from iRacing
 */
export const getUserRecentRacesProcedure = iracingProcedure
  .input(IRacingGetUserRecentRacesInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    const recentRaces = await fetchData({
      query: `/data/stats/member_recent_races?cust_id=${input.custId}`,
      authCode: ctx.iracingAuthCode,
    });

    return recentRaces || null;
  });
