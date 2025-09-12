import { desc, gt } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/db";
import { seriesTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";
import { detectSpecialEventSeries } from "../utilities";

import { GetAllSeriesResponse } from "@/modules/iracing/server/procedures/get-all-series/schema";

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
  seriesCacheParams,
  authCode,
}: {
  seriesCacheParams: string;
  seasonYear: string;
  seasonQuarter: string;
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
    // TODO: Might change to /data/series/season_list
    // Gives current schedule and current series
    const response = await fetchData({
      query: `/data/series/get`,
      authCode: authCode,
    });

    if (!response) {
      throw new Error("Failed to get series.");
    }

    const seasonSeries = GetAllSeriesResponse.parse(response);

    const insertValues = seasonSeries.map((series) => {
      const specialEventInfo = detectSpecialEventSeries(series.series_name);

      return {
        seriesId: series.series_id,
        seriesName: series.series_name,
        seriesShortName: series.series_short_name,
        category: series.category,
        categoryId: series.category_id,
        eligible: series.eligible,
        maxStarters: series.max_starters,
        minStarters: series.min_starters,
        isSpecialEvent: specialEventInfo.isSpecialEvent,
        specialEventType: specialEventInfo.specialEventType,
      };
    });

    await db.transaction(async (tx) => {
      await tx.delete(seriesTable);
      await tx.insert(seriesTable).values(insertValues);
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error in cacheSeries:", error);
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred." };
  }
};
