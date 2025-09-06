import { DateTime } from "luxon";

import { gt } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesTable } from "@/db/schema";
import { fetchData } from "../../api";
import { IRacingGetAllSeriesResponse } from "@/modules/iracing/types";
import { TRPCError } from "@trpc/server";

export const cacheAllSeries = iracingProcedure.query(async ({ ctx }) => {
  throw new TRPCError({code: "NOT_FOUND", message: "TESTINg"})
  
    const cachedSeries = await db
    .select()
    .from(seriesTable)
    .where(
      gt(seriesTable.updatedAt, DateTime.now().minus({ weeks: 1 }).toJSDate()),
    );

  if (cachedSeries.length > 0) {
    return { success: true };
  }

  console.log("Refreshing All Series");
  const data = (await fetchData({
    query: `/data/series/get`,
    authCode: ctx.iracingAuthCode,
  })) as IRacingGetAllSeriesResponse[];

  if (!data) {
    throw new Error("Failed to get series");
  }

  const insertValues = data.map((item) => ({
    seriesId: item.series_id,
    category: item.category,
    seriesName: item.series_name,
  }));

  try {
    await db.delete(seriesTable);
    await db.insert(seriesTable).values(insertValues);
  } catch (error) {
    console.error("Failed to update database with new series")
  }
});
