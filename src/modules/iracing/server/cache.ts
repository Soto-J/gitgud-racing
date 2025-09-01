import fs from "fs";
import path from "path";

import { desc, gt } from "drizzle-orm";

import { db } from "@/db";
import { seriesTable, seriesWeeklyStatsTable } from "@/db/schema";

import { CACHE_DURATION_MS, IRACING_URL } from "./config";
import { fetchData } from "./api";
import { getOrRefreshAuthCode } from "./authentication";

import {
  IracingGetAllSeriesResponse,
  IracingSeriesResultsResponse,
} from "@/modules/iracing/types";
import { DateTime } from "luxon";

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
          DateTime.now().minus({ millisecond: CACHE_DURATION_MS }).toISO(),
        ),
      );

    if (cachedSeries.length > 0) {
      console.log("Using cached series");
      return { success: true };
    }

    console.log("Refreshing All Series");
    const data = (await fetchData({
      query: `/data/series/get`,
      authCode: authCode,
    })) as IracingGetAllSeriesResponse[];

    if (!data) {
      throw new Error("Failed to get series");
    }

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
    return { success: false, error: "Unknown error occurred" };
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
          DateTime.now().minus({ millisecond: CACHE_DURATION_MS }).toISO(),
          // (Date.now() - CACHE_DURATION_MS).toISOString(),
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

    const seriesResults = seriesResultsSettled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value as IracingSeriesResultsResponse[]);

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
          {} as Record<string, IracingSeriesResultsResponse[]>,
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

/**
 * Downloads and caches series logo images to local filesystem
 *
 * This function fetches series logos from iRacing and stores them in the
 * public/series-logos directory for local serving. This reduces load times
 * and dependency on iRacing's image servers.
 *
 * @returns {Promise<void>} Completes when all images are processed
 *
 * @throws Will log errors but not throw to allow partial success
 *
 * @example
 * ```typescript
 * await cacheSeriesImages();
 * // Check public/series-logos directory for downloaded images
 * ```
 */
export const cacheSeriesImages = async (): Promise<void> => {
  const allSeries = await db.select().from(seriesTable);

  if (!allSeries || allSeries.length === 0) {
    console.error("No series found.");
    return;
  }

  // Create directory if it doesn't exist
  const logoDir = path.join(process.cwd(), "public", "series-logos");
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  const authCode = await getOrRefreshAuthCode();

  try {
    const promiseArr = allSeries.map(async (series) => {
      const imageUrl = `${IRACING_URL}/data/series/${series.seriesId}/logo`;

      const response = await fetch(imageUrl, {
        headers: {
          Cookie: `authtoken_members=${authCode}`,
        },
      });

      if (!response.ok) {
        console.log("Response", response);
        throw new Error(
          `Failed to fetch image for series ${series.seriesName}, seriesId: ${series.seriesId}`,
        );
      }

      return {
        seriesId: series.seriesId,
        seriesName: series.seriesName,
        buffer: await response.arrayBuffer(),
      };
    });

    const results = await Promise.allSettled(promiseArr);

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { seriesId, seriesName, buffer } = result.value;

        const filename = `${seriesName}.png`;
        const filepath = path.join(logoDir, filename);

        try {
          fs.writeFileSync(filepath, Buffer.from(buffer));
        } catch (writeError) {
          console.error(`Failed to write ${filename}:`, writeError);
        }
      }
    });

    console.log(`Finished caching series images. Check ${logoDir}`);
  } catch (error) {
    console.error(error);
  }
};
