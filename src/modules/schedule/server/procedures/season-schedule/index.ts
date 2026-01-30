import { ZodError } from "zod";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { fetchIracingData } from "@/modules/iracing/server/api";

import {
  SeasonScheduleInputSchema,
  SeasonScheduleResponse,
} from "@/modules/schedule/server/procedures/season-schedule/types/schema";

export const seasonScheduleProcedure = iracingProcedure
  .input(SeasonScheduleInputSchema)
  .query(async ({ ctx, input }) => {
    const response = await fetchIracingData(
      `/data/series/season_list?include_series=${input.includeSeries}&season_year=${input.seasonYear}&season_quarter=${input.seasonQuarter}`,
      ctx.iracingAccessToken,
    );

    if (!response) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to fetch season schedule from iRacing API.",
      });
    }

    try {
      return {
        seasonsSchedule: SeasonScheduleResponse.parse(response).seasons,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid response format from iRacing API",
          cause: error,
        });
      }

      throw error;
    }
  });
