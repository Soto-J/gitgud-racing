import { desc, count, or, like } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";

/**
 * Fetches paginated weekly series results with search functionality
 */
export const weeklySeriesResultsProcedure = iracingProcedure
  .input(WeeklySeriesResultsInput)
  .query(async ({ input }) => {
    const { search, page, pageSize } = input;

    const orClause = search
      ? or(
          like(seriesWeeklyStatsTable.name, `%${search}%`),
          like(seriesWeeklyStatsTable.trackName, `%${search}%`),
        )
      : undefined;

    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(orClause)
      .orderBy(
        desc(seriesWeeklyStatsTable.averageEntrants),
        desc(seriesWeeklyStatsTable.averageSplits),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    if (!weeklyResults?.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No weekly results found",
      });
    }

    const [total] = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(orClause);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      series: weeklyResults,
      total: total.count,
      totalPages,
    };
  });
