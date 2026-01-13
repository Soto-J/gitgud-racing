import { count, like, or, eq, and } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";
// import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

export const totalSeriesCountProcedure = iracingProcedure
  .input(
    WeeklySeriesResultsInput.pick({
      search: true,
      pageSize: true,
      raceWeek: true,
      year: true,
      quarter: true,
    }),
  )
  .query(async ({ input }) => {
    const { search, pageSize, raceWeek, year, quarter } = input;

    // Get current season info for default values
    // const { currentRaceWeek, currentYear, currentQuarter } =
    //   getCurrentSeasonInfo();

    // Build search clause with season filters and optional text search
    // const searchClause = and(
    // Filter by race week (use current if not specified)
    // eq(seriesWeeklyStatsTable.raceWeek, raceWeek ?? +currentRaceWeek),
    // Filter by season year (use current if not specified)
    // eq(seriesWeeklyStatsTable.seasonYear, year ?? +currentYear),
    // Filter by season quarter (use current if not specified)
    // eq(seriesWeeklyStatsTable.seasonQuarter, quarter ?? +currentQuarter),
    // Add text search across series and track names if provided
    // search
    //   ? or(
    //       like(seriesWeeklyStatsTable.name, `%${search}%`),
    //       like(seriesWeeklyStatsTable.trackName, `%${search}%`),
    //     )
    //   : undefined,
    // );

    // const total = await db
    //   .select({ count: count() })
    //   .from(seriesWeeklyStatsTable)
    //   .where(searchClause)
    //   .then((row) => row[0]);

    // const totalPages = Math.max(1, Math.ceil(total.count / pageSize));

    // return { totalPages };
  });
