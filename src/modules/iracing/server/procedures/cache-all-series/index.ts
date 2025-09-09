import z from "zod";
import { DateTime } from "luxon";

import { gt } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";

import { fetchData } from "@/modules/iracing/server/api";

import { seriesTable } from "@/db/schemas";
import { IRacingGetAllSeriesResponseSchema } from "./schema";

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

  const data = IRacingGetAllSeriesResponseSchema.parse(res);

  const insertValues = data.map((item) => ({
    seriesId: item.series_id,
    category: item.category,
    seriesName: item.series_name,
  }));

  try {
    await db.transaction(async () => {
      await db.delete(seriesTable);
      await db.insert(seriesTable).values(insertValues);
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
