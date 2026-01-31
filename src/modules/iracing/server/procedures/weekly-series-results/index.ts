import { desc, count, or, like, eq, and } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";
// import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

export const weeklySeriesResultsProcedure = iracingProcedure
  .input(WeeklySeriesResultsInput)
  .query(async ({ input }) => {
    const { raceWeek, year, quarter, pageSize, page } = input;

    // Get current season info for default values
    // const { currentRaceWeek, currentYear, currentQuarter } =
    //   getCurrentSeasonInfo();

    // Build search clause with season filters and optional text search
    const searchClause = and(
      // Filter by race week (use current if not specified)
      // eq(seriesWeeklyStatsTable.raceWeek, raceWeek ?? +currentRaceWeek),
      // Filter by season year (use current if not specified)
      // eq(seriesWeeklyStatsTable.seasonYear, year ?? +currentYear),
      // Filter by season quarter (use current if not specified)
      // eq(seriesWeeklyStatsTable.seasonQuarter, quarter ?? +currentQuarter),
      // Add text search across series and track names if provided
      input?.search
        ? or(
            like(seriesWeeklyStatsTable.name, `%${input.search}%`),
            like(seriesWeeklyStatsTable.trackName, `%${input.search}%`),
          )
        : undefined,
    );

    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      // .orderBy(
      //   desc(seriesWeeklyStatsTable.averageEntrants), // Most popular series first
      //   desc(seriesWeeklyStatsTable.averageSplits), // Then by split count
      // )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const total = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      .then((row) => row[0]);

    const totalPages = Math.max(1, Math.ceil(total.count / pageSize));

    return {
      series: weeklyResults,
      total: total.count,
      totalPages,
    };
  });
