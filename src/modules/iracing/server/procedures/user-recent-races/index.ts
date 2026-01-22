import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { fetchIracingData } from "@/modules/iracing/server/api";

import {
  GetUserRecentRacesInput,
  GetUserRecentRacesResponse,
} from "@/modules/iracing/server/procedures/user-recent-races/schema";

export const userRecentRacesProcedure = iracingProcedure
  .input(GetUserRecentRacesInput)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    const res = await fetchIracingData(
      `/data/stats/member_recent_races?cust_id=${input.custId}`,
      ctx.iracingAccessToken,
    );

    const recentRaces = GetUserRecentRacesResponse.parse(res);

    return recentRaces || null;
  });
