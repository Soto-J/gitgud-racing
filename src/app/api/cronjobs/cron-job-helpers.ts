import { desc, gt } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/db";
import { seriesTable, seriesWeeklyStatsTable } from "@/db/schema";

import { fetchData } from "@/modules/iracing/server/api";

import { IRacingGetAllSeriesResponseSchema } from "@/modules/iracing/server/procedures/cache-all-series/schema";

import {
  IRacingSeriesResults,
  IRacingSeriesResultsPromiseResponseSchema,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";

export const getCurrentSeasonInfo = () => {
  const year = DateTime.now().year;

  // iRacing seasons typically start on these dates (adjust based on actual schedule)
  const seasonStarts = [
    DateTime.local(year, 3, 12), // Season 1: ~March 12 (Week 0)
    DateTime.local(year, 5, 11), // Season 2: ~June 11 (Week 0)
    DateTime.local(year, 8, 10), // Season 3: ~September 10 (Week 0)
    DateTime.local(year, 11, 10), // Season 4: ~December 10 (Week 0)
  ];

  // Find current season
  let currentSeasonIndex = 0;
  let seasonStartDate = seasonStarts[0];

  if (DateTime.now() < seasonStarts[0]) {
    // Before Season 1 of the current year: treat as last year's Season 4
    currentSeasonIndex = 3;
    seasonStartDate = DateTime.local(year - 1, 11, 10);
  } else {
    for (let i = seasonStarts.length - 1; i >= 0; i--) {
      if (DateTime.now() >= seasonStarts[i]) {
        currentSeasonIndex = i;
        seasonStartDate = seasonStarts[i];
        break;
      }
    }
  }

  // Calculate weeks since season start
  const weeksSinceStart = Math.floor(
    DateTime.now().diff(seasonStartDate).weeks,
  );

  const currentRaceWeek = (
    Math.max(0, Math.min(weeksSinceStart, 12)) - 1
  ).toString();

  const currentQuarter = Math.ceil((DateTime.now().month + 1) / 3).toString();
  const currentSeasonYear = DateTime.now().year.toString();

  return {
    currentRaceWeek,
    currentQuarter,
    currentYear: currentSeasonYear,
  };
};

export const createSearchParams = (params: {
  season_year: string;
  season_quarter: string;
  event_types?: string;
  official_only?: string;
  race_week_num?: string;
  start_range_begin?: string;
  start_range_end?: string;
  cust_id?: string;
  team_id?: string;
  category_id?: string;
}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
};

/**
 * Caches all iRacing series data to the database
 *
 * This function fetches series information from iRacing and stores it locally.
 * Data is cached for 7 days to reduce API calls. If cached data exists and is
 * still fresh, it returns immediately without making API calls.
 *
 * @param params - Parameters for caching operation
 * @param params.authCode - Valid iRacing authentication code
 *
 * @returns {Promise<{success: boolean, error?: string}>} Operation result
 *
 * @throws Will not throw but returns error in result object
 *
 * @example
 * ```typescript
 * const authCode = await getOrRefreshAuthCode();
 * const result = await cacheSeries({ authCode });
 * if (!result.success) {
 *   console.error("Failed to cache series:", result.error);
 * }
 * ```
 */
export const cacheSeries = async ({
  authCode,
}: {
  authCode: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const cachedSeries = await db
      .select()
      .from(seriesTable)
      .where(
        gt(
          seriesTable.updatedAt,
          DateTime.now().minus({ weeks: 1 }).toJSDate(),
        ),
      );

    if (cachedSeries.length > 0) {
      console.log("Using cached series...");
      return { success: true };
    }

    console.log("Refreshing All Series...");
    const res = await fetchData({
      query: `/data/series/get`,
      authCode: authCode,
    });

    if (!res) {
      throw new Error("Failed to get series.");
    }

    const data = IRacingGetAllSeriesResponseSchema.parse(res);

    const insertValues = data.map((item) => ({
      seriesId: item.series_id,
      category: item.category,
      seriesName: item.series_name,
    }));

    await db.delete(seriesTable);
    await db.insert(seriesTable).values(insertValues);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheSeries:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred." };
  }
};

/**
 * Caches weekly race results for all series
 *
 * This function fetches race results for all series and computes statistics
 * like average splits per race, total drivers, etc. Results are cached for
 * 7 days to minimize API usage.
 *
 * @param params - Parameters for caching operation
 * @param params.authCode - Valid iRacing authentication code
 * @param params.searchParams - URL search parameters for filtering results
 *
 * @returns {Promise<{success: boolean, error?: string}>} Operation result
 *
 * @throws Will not throw but returns error in result object
 *
 * @example
 * ```typescript
 * const authCode = await getOrRefreshAuthCode();
 * const searchParams = "?season_year=2024&season_quarter=1";
 * const result = await cacheWeeklyResults({ authCode, searchParams });
 * ```
 */
export const cacheWeeklyResults = async ({
  authCode,
  searchParams,
}: {
  authCode: string;
  searchParams: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(
        gt(
          seriesWeeklyStatsTable.updatedAt,
          DateTime.now().minus({ weeks: 1 }).toJSDate(),
        ),
      );

    if (weeklyResults.length > 0) {
      console.log("Using cached weekly results.");
      return { success: true };
    }

    console.log("Refreshing weekly results.");

    const allSeries = await db
      .select()
      .from(seriesTable)
      .orderBy(desc(seriesTable.seriesId));

    if (!allSeries) {
      console.error("Failed to retrieve series table.");
      return { success: false, error: "No series data available" };
    }

    const promiseArr = allSeries.map((series) =>
      fetchData({
        query: `/data/results/search_series${searchParams}&series_id=${series.seriesId}`,
        authCode: authCode,
      }),
    );

    const seriesResultsSettled = await Promise.allSettled(promiseArr);

    const res = seriesResultsSettled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const seriesResults = IRacingSeriesResultsPromiseResponseSchema.parse(res);

    const perRaceStats = seriesResults
      .filter((series) => series.length > 0)
      .map((series) => {
        const uniqueRaces = series.reduce(
          (obj, session) => {
            if (!obj[session.start_time]) {
              obj[session.start_time] = [];
            }

            obj[session.start_time].push(session);
            return obj;
          },
          {} as Record<string, IRacingSeriesResults[]>,
        );

        const totalRaces = Object.values(uniqueRaces).length;
        const totalSplits = series.length;
        const totalDrivers = series.reduce(
          (total, session) => total + session.num_drivers,
          0,
        );

        const avgSplitPerRace =
          totalRaces > 0 ? (totalSplits / totalRaces).toFixed(2) : "0";
        const avgEntrantPerSeries =
          totalSplits > 0 ? (totalDrivers / totalSplits).toFixed(2) : "0";

        return {
          seriesId: series[0].series_id,
          seasonId: series[0].season_id,
          sessionId: series[0].session_id,
          name: series[0].series_name.trim(),
          seasonYear: series[0].season_year,
          seasonQuarter: series[0].season_quarter,
          raceWeek: series[0].race_week_num,
          trackName: series[0].track.track_name.trim(),
          startTime: series[0].start_time.trim(),
          totalSplits,
          totalDrivers,
          strengthOfField: series[0].event_strength_of_field,
          averageEntrants: avgEntrantPerSeries,
          averageSplits: avgSplitPerRace,
        };
      });

    await db.insert(seriesWeeklyStatsTable).values(perRaceStats);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheWeeklyResults:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
};
