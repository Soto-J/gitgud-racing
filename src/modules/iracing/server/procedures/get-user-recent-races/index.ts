import { iracingProcedure } from "@/trpc/init";

import { fetchData } from "@/modules/iracing/server/api";

import {
  GetUserRecentRacesInput,
  GetUserRecentRacesResponse,
} from "@/modules/iracing/server/procedures/get-user-recent-races/schema";

export const getUserRecentRacesProcedure = iracingProcedure
  .input(GetUserRecentRacesInput)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    const res = await fetchData({
      query: `/data/stats/member_recent_races?cust_id=${input.custId}`,
      authCode: ctx.iracingAuthCode,
    });

    const recentRaces = GetUserRecentRacesResponse.parse(res);

    return recentRaces || null;
  });
