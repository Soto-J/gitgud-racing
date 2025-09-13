import { desc, count, or, like, eq, and } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

/**
 * Fetches paginated weekly series results with search functionality
 */
export const weeklySeriesResultsProcedure = iracingProcedure
  .input(WeeklySeriesResultsInput)
  .query(async ({ input }) => {
    const seasonInfo = getCurrentSeasonInfo();

    const searchClause = and(
      // eq(
      //   seriesWeeklyStatsTable.raceWeek,
      //   Number(input.raceWeek) ?? +seasonInfo.currentRaceWeek,
      // ),
      // eq(
      //   seriesWeeklyStatsTable.seasonYear,
      //   Number(input.year) ?? +seasonInfo.currentYear,
      // ),
      // eq(
      //   seriesWeeklyStatsTable.seasonQuarter,
      //   Number(input.quarter) ?? +seasonInfo.currentQuarter,
      // ),
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
      .orderBy(
        desc(seriesWeeklyStatsTable.averageEntrants),
        desc(seriesWeeklyStatsTable.averageSplits),
      )
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize);

    const total = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      .then((row) => row[0]);

    const totalPages = Math.ceil(total.count / input.pageSize);

    return {
      series: weeklyResults,
      total: total.count,
      totalPages,
    };
  });
