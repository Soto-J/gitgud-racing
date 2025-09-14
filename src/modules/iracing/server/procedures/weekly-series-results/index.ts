/**
 * @fileoverview Weekly series results tRPC procedure for fetching iRacing series statistics
 *
 * This module implements the main procedure for retrieving paginated weekly
 * series results with support for filtering by season parameters and search terms.
 */

import { desc, count, or, like, eq, and } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";
import { getCurrentSeasonInfo } from "@/app/api/cronjobs/utilities";

/**
 * Fetches paginated weekly series results with search and filtering functionality
 *
 * This procedure provides comprehensive series statistics with support for:
 * - Pagination with configurable page size
 * - Text search across series and track names
 * - Season filtering by race week, year, and quarter
 * - Ordering by participation metrics (entrants and splits)
 * - Total count for pagination metadata
 *
 * @returns Paginated series results with metadata
 *
 * @example
 * ```typescript
 * // Frontend usage
 * const { data } = trpc.iracing.weeklySeriesResults.useQuery({
 *   page: 1,
 *   pageSize: 20,
 *   search: "Formula",
 *   raceWeek: "12",
 *   year: "2024",
 *   quarter: "1"
 * });
 *
 * // Result structure:
 * // {
 * //   series: [...], // Array of series data
 * //   total: 150,    // Total matching records
 * //   totalPages: 8  // Total pages available
 * // }
 * ```
 */
export const weeklySeriesResultsProcedure = iracingProcedure
  .input(WeeklySeriesResultsInput)
  .query(async ({ input }) => {
    const { raceWeek, year, quarter, pageSize, page } = input;

    // Get current season info for default values
    const { currentRaceWeek, currentYear, currentQuarter } =
      getCurrentSeasonInfo();

    // Build search clause with season filters and optional text search
    const searchClause = and(
      // Filter by race week (use current if not specified)
      eq(
        seriesWeeklyStatsTable.raceWeek,
        raceWeek ? Number(raceWeek) : +currentRaceWeek,
      ),
      // Filter by season year (use current if not specified)
      eq(seriesWeeklyStatsTable.seasonYear, year ? Number(year) : +currentYear),
      // Filter by season quarter (use current if not specified)
      eq(
        seriesWeeklyStatsTable.seasonQuarter,
        quarter ? Number(quarter) : +currentQuarter,
      ),
      // Add text search across series and track names if provided
      input?.search
        ? or(
            like(seriesWeeklyStatsTable.name, `%${input.search}%`),
            like(seriesWeeklyStatsTable.trackName, `%${input.search}%`),
          )
        : undefined,
    );

    // Fetch paginated results ordered by participation metrics
    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      .orderBy(
        desc(seriesWeeklyStatsTable.averageEntrants), // Most popular series first
        desc(seriesWeeklyStatsTable.averageSplits),   // Then by split count
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Get total count for pagination metadata
    const total = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      .then((row) => row[0]);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      series: weeklyResults,
      total: total.count,
      totalPages,
    };
  });
