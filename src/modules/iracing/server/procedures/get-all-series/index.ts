import { DateTime } from "luxon";
import { count, desc, like, or, gt } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesTable, seriesWeeklyStatsTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";
import { GetAllSeriesResponse } from "@/modules/iracing/server/procedures/get-all-series/schema";

/**
 * Fetches all available racing series
 */
export const getAllSeriesProcedure = iracingProcedure.query(async () => {
  return await db
    .select()
    .from(seriesTable)
    .orderBy(desc(seriesTable.seriesName));
});

export const getTotalSeriesCountProcedure = iracingProcedure
  .input(
    WeeklySeriesResultsInput.pick({
      search: true,
      pageSize: true,
    }),
  )
  .query(async ({ input }) => {
    const { search, pageSize } = input;

    const [total] = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(
        search
          ? or(
              like(seriesWeeklyStatsTable.name, `%${search}%`),
              like(seriesWeeklyStatsTable.trackName, `%${search}%`),
            )
          : undefined,
      );

    const totalPages = Math.ceil(total.count / pageSize);

    return { totalPages };
  });

export const cacheAllSeries = iracingProcedure.query(async ({ ctx }) => {
  const cachedSeries = await db
    .select()
    .from(seriesTable)
    .where(
      gt(seriesTable.updatedAt, DateTime.now().minus({ weeks: 1 }).toJSDate()),
    );

  if (cachedSeries.length > 0) {
    return { success: true, message: "Using cached series..." };
  }

  console.log("Refreshing All Series...");
  const res = await fetchData({
    query: `/data/series/get`,
    authCode: ctx.iracingAuthCode,
  });

  if (!res) {
    return { success: false, message: "Failed to fetch series..." };
  }

  const data = GetAllSeriesResponse.parse(res);

  const insertValues = data.map((item) => ({
    seriesId: item.series_id,
    category: item.category,
    seriesName: item.series_name,
  }));

  try {
    await db.transaction(async (tx) => {
      await tx.delete(seriesTable);
      await tx.insert(seriesTable).values(insertValues);
    });

    return { success: true, message: "Successfully cached series..." };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: `Error: ${error.message}...` };
    }

    return {
      success: false,
      message: "Failed to update database with new series...",
    };
  }
});
