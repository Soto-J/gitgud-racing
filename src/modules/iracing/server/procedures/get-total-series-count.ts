import { count, or, like } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schema";

import { IRacingWeeklySeriesResultsInputSchema } from "@/modules/iracing/schema";

/**
 * Gets total page count for series results pagination
 */
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
