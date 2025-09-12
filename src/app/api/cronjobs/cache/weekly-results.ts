import { desc, gt } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/db";
import { seriesTable, seriesWeeklyStatsTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";
import { isCurrently13thWeek } from "../utilities";

import {
  WeeklySeriesResultsItemType,
  WeeklySeriesResultsPromiseResponse,
} from "@/modules/iracing/server/procedures/weekly-series-results/schema";

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
      console.log(
        `Using cached weekly results..\nYear ~ ${weeklyResults[0].seasonYear}, Quarter ~ ${weeklyResults[0].seasonQuarter}, Race Week ~ ${weeklyResults[0].raceWeek}`,
      );

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

    // Filter out 13th week series unless we're currently in 13th week
    const currentlyIs13thWeek = isCurrently13thWeek();
    const seriesToFetch = allSeries.filter((series) => {
      if (series.isSpecialEvent && series.specialEventType === "13th_week") {
        if (!currentlyIs13thWeek) {
          console.log(
            `Skipping 13th week series "${series.seriesName}" - not currently in 13th week`,
          );
          return false;
        }
        console.log(
          `Including 13th week series "${series.seriesName}" - currently in 13th week`,
        );
      }
      return true;
    });

    console.log(
      `Fetching data for ${seriesToFetch.length} series (${allSeries.length - seriesToFetch.length} series skipped)`,
    );

    const promiseArr = seriesToFetch.map((series) => {
      const query = `/data/results/search_series${searchParams}&series_id=${series.seriesId}`;
      console.log(`Fetching data for series ${series.seriesId}: ${query}`);
      return fetchData({
        query,
        authCode: authCode,
      });
    });

    const seriesResultsSettled = await Promise.allSettled(promiseArr);

    const rejectedFetches = seriesResultsSettled.filter(
      (result) => result.status === "rejected",
    );

    if (rejectedFetches.length > 0) {
      console.warn(`Rejected series results: ${rejectedFetches.length}`);

      // Log specific error details for debugging
      rejectedFetches.forEach((result, index) => {
        if (result.status === "rejected") {
          const error = result.reason;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          if (errorMessage.includes("No chunk file names found")) {
            console.log(
              `Series ${seriesToFetch[seriesResultsSettled.indexOf(result)]?.seriesId || "unknown"} has no race data - this is expected for inactive/special event series`,
            );
          } else {
            console.error(`Series fetch error:`, {
              seriesId:
                seriesToFetch[seriesResultsSettled.indexOf(result)]?.seriesId,
              error: errorMessage,
            });
          }
        }
      });
    }

    const res = seriesResultsSettled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const seriesResults = WeeklySeriesResultsPromiseResponse.parse(res);

    console.log(`Total series results: ${seriesResults.length}`);
    console.log(
      `Series with data: ${seriesResults.filter((series) => series.length > 0).length}`,
    );

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

    if (perRaceStats.length > 0) {
      await db.insert(seriesWeeklyStatsTable).values(perRaceStats);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheWeeklyResults:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
};
