import { count, desc, like, or } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesTable, seriesWeeklyStatsTable } from "@/db/schema";

import { IRacingWeeklySeriesResultsInputSchema } from "./schema";
import { TRPCError } from "@trpc/server";
/**
 * Fetches all available racing series
 */
export const getAllSeriesProcedure = iracingProcedure.query(async () => {
  throw new TRPCError({ code: "NOT_FOUND", message: "TESTINg" });

  const allSeries = await db
    .select()
    .from(seriesTable)
    .orderBy(desc(seriesTable.seriesName));

  if (!allSeries?.length) {
    return [];
  }

  return allSeries;
});

export const getTotalSeriesCountProcedure = iracingProcedure
  .input(
    IRacingWeeklySeriesResultsInputSchema.pick({
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
