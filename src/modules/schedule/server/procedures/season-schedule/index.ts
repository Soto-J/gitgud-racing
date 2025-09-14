import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { fetchData } from "@/modules/iracing/server/api";

import {
  SeasonScheduleInputSchema,
  SeasonScheduleResponse,
} from "@/modules/schedule/server/procedures/season-schedule/schema";

export const seasonScheduleProcedure = iracingProcedure
  .input(SeasonScheduleInputSchema)
  .query(async ({ ctx, input }) => {
    const response = await fetchData({
      query: `/data/series/season_list?include_series=${input.includeSeries}&season_year=${input.seasonYear}&season_quarter=${input.seasonQuarter}`,
      authCode: ctx.iracingAuthCode,
    });

    if (!response) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch season schedule from iRacing API.",
      });
    }

    try {
      const parsed = SeasonScheduleResponse.parse(response);
      return {
        seasonsSchedule: parsed.seasons,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid response format from iRacing API",
        cause: error,
      });
    }
  });
