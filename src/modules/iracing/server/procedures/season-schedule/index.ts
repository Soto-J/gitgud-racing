import { iracingProcedure } from "@/trpc/init";

import {
  GetSeasonScheduleInput,
  GetSeasonsInput,
} from "@/modules/iracing/server/procedures/season-schedule/schema";
import { fetchData } from "../../api";

export const seasonScheduleProcedure = iracingProcedure
  .input(GetSeasonScheduleInput)
  .query(async ({ input }) => {});

export const cacheSeasonsProcedure = iracingProcedure
  .input(GetSeasonsInput)
  .query(async ({ ctx, input }) => {
    const { includeSearies, seasonYear, seasonQuarter } = input;

    await fetchData({
      query: `/series/seaons?include_series=${includeSearies}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
      authCode: ctx.iracingAuthCode,
    });
  });
