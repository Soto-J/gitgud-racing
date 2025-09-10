import { z } from "zod";
import { desc, gt, sql } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/db";
import {
  seasonTable,
  seriesTable,
  seriesWeeklyStatsTable,
  raceScheduleTable,
} from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";
import { buildScheduleData, buildSeasonsData } from "./utilities";

import { GetSeasonsResponse } from "@/modules/iracing/server/procedures/season-schedule/schema";
import { GetAllSeriesResponse } from "@/modules/iracing/server/procedures/get-all-series/schema";

import {
  WeeklySeriesResultsItemType,
  WeeklySeriesResultsPromiseResponse,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";

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

    const data = GetAllSeriesResponse.parse(res);

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

    const seriesResults = WeeklySeriesResultsPromiseResponse.parse(res);

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
          {} as Record<string, WeeklySeriesResultsItemType[]>,
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

export const cacheSeasonsSchedule = async ({
  includeSeries,
  seasonYear,
  seasonQuarter,
  authCode,
}: {
  includeSeries: string;
  seasonYear: string;
  seasonQuarter: string;
  authCode: string;
}) => {
  const seasons = await db
    .select()
    .from(seasonTable)
    .orderBy(desc(seasonTable.updatedAt));

  const latestSeason = seasons[0];

  const hasFreshData =
    latestSeason &&
    latestSeason.seasonYear === +seasonYear &&
    latestSeason.seasonQuarter === +seasonQuarter;

  if (hasFreshData) {
    console.log("Seasons schedule still fresh.");
    return;
  }

  const response = await fetchData({
    query: `/series/seasons?include_series=${includeSeries}&season_year=${seasonYear}&season_quarter=${seasonQuarter}`,
    authCode,
  });

  if (!response) {
    console.warn("Failed to fetch season data...");
    return { success: false, message: "Failed to fetch season data..." };
  }

  const seasonsResponse = z.array(GetSeasonsResponse).parse(response);
  if (seasonsResponse.length === 0) {
    console.warn("No seasons found in response..");
    return { success: false, message: "No seasons found in response." };
  }

  const schedules = seasonsResponse.flatMap((season) => season.schedules);

  const schedulesData = buildScheduleData(schedules);
  const seasonsData = buildSeasonsData(seasonsResponse);

  if (!seasonsData || !schedulesData) {
    console.warn("Failed to build data...");
    return {
      success: false,
      message: "Failed to fetch season data...",
    };
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(seasonTable)
        .values(seasonsData)
        .onDuplicateKeyUpdate({
          set: {
            active: sql`VALUES(active)`,
            complete: sql`VALUES(complete)`,
            updatedAt: sql`NOW()`,
          },
        });

      await tx
        .insert(raceScheduleTable)
        .values(schedulesData)
        .onDuplicateKeyUpdate({
          set: {
            id: sql`id`,
          },
        });
    });

    return {
      success: true,
      message: `Successfully cached ${seasonsResponse.length} seasons with ${schedulesData.length} total race weeks`,
      seasonsProcessed: seasonsResponse.length,
      seasonIds: seasonsData.map((season) => season.id),
      totalScheduleCount: schedulesData.length,
    };
  } catch (error) {
    console.error("Error in cacheSeasonsSchedule", {
      error,
      seasonsData,
      schedulesData,
    });
    if (error instanceof Error) {
      return { success: false, message: `Error: ${error.message}` };
    }
    return { success: false, message: "Unknown error occurred" };
  }
};
