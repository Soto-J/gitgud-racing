import { desc } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { seriesTable } from "@/db/schema";

/**
 * Fetches all available racing series
 */
export const getAllSeriesProcedure = iracingProcedure.query(async () => {
  const allSeries = await db
    .select()
    .from(seriesTable)
    .orderBy(desc(seriesTable.seriesName));

  if (!allSeries?.length) {
    return [];
  }

  return allSeries;
});
