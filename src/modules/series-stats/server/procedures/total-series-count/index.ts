import { count, like, or } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesWeeklyStatsTable } from "@/db/schemas";

import { WeeklySeriesResultsInput } from "@/modules/iracing/server/procedures/weekly-series-results/schema";

export const totalSeriesCountProcedure = iracingProcedure
  .input(
    WeeklySeriesResultsInput.pick({
      search: true,
      pageSize: true,
    }),
  )
  .query(async ({ input }) => {
    const { search, pageSize } = input;

    const total = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(
        search
          ? or(
              like(seriesWeeklyStatsTable.name, `%${search}%`),
              like(seriesWeeklyStatsTable.trackName, `%${search}%`),
            )
          : undefined,
      )
      .then((row) => row[0]);

    const totalPages = Math.ceil(total.count / pageSize);

    return { totalPages };
  });
