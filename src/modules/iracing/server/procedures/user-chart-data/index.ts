/**
 * @fileoverview User chart data tRPC procedure for fetching iRacing statistics
 *
 * This module implements the main procedure for retrieving user chart data,
 * including caching logic, API fetching, and data transformation.
 */

import { desc, eq, sql } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, userChartDataTable } from "@/db/schemas";

import { fetchData } from "@/modules/iracing/server/api";

import {
  categoryMap,
  IRACING_CHART_TYPE_IRATING,
} from "@/modules/iracing/constants";

import {
  chartDataIsFresh,
  transformCharts,
  buildChartData,
} from "@/modules/iracing/server/procedures/user-chart-data/utilities";

import {
  UserChartDataInputSchema,
  UserChartDataResponseSchema,
} from "./schema";

/**
 * Fetches and caches user chart data (iRating history) from iRacing
 *
 * This procedure implements a cache-first strategy:
 * 1. Check if cached data is fresh (updated after last Monday 8 PM reset)
 * 2. If fresh, return transformed cached data
 * 3. If stale, fetch fresh data from iRacing API for all categories
 * 4. Update cache and return transformed data
 *
 * @returns Grouped chart data by racing discipline or null if user not found
 *
 * @example
 * ```typescript
 * // Frontend usage
 * const chartData = await trpc.iracing.userChartData.useQuery({
 *   userId: "user123"
 * });
 *
 * // Result structure:
 * // {
 * //   "Oval": { discipline: "Oval", chartData: [...] },
 * //   "Sports": { discipline: "Sports", chartData: [...] }
 * // }
 * ```
 */
export const userChartDataProcedure = iracingProcedure
  .input(UserChartDataInputSchema)
  .query(async ({ ctx, input }) => {
    // Step 1: Get user's iRacing ID from their profile
    const userProfile = await db
      .select({ iracingId: profileTable.iracingId })
      .from(profileTable)
      .where(eq(profileTable.userId, input.userId))
      .then((row) => row[0]);

    if (!userProfile?.iracingId) {
      return null;
    }

    // Step 2: Check existing cached chart data
    const chartData = await db
      .select()
      .from(userChartDataTable)
      .where(eq(userChartDataTable.userId, input.userId))
      .orderBy(desc(userChartDataTable.updatedAt));

    // Step 3: Return cached data if it's fresh (updated after last reset)
    if (chartDataIsFresh(chartData[0])) {
      return transformCharts(chartData);
    }

    // Step 4: Fetch fresh data from iRacing API for all racing categories
    const promiseArr = Object.keys(categoryMap).map((categoryId) =>
      fetchData({
        query: `/data/member/chart_data?chart_type=${IRACING_CHART_TYPE_IRATING}&cust_id=${userProfile.iracingId}&category_id=${categoryId}`,
        authCode: ctx.iracingAuthCode,
      }),
    );

    const results = await Promise.allSettled(promiseArr);

    // Step 5: Handle partial failures gracefully
    const failedResults = results.filter((res) => res.status === "rejected");

    if (failedResults.length > 0) {
      console.warn("Some chart data requests failed:", failedResults);
    }

    // Step 6: Process successful API responses
    const res = results
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);

    if (res.length === 0) {
      return [];
    }

    // Step 7: Validate and transform API data for database insertion
    const data = UserChartDataResponseSchema.parse(res);
    const dataToInsert = buildChartData(data, input.userId);

    // Step 8: Update cache with fresh data (upsert on duplicate keys)
    await db
      .insert(userChartDataTable)
      .values(dataToInsert)
      .onDuplicateKeyUpdate({
        set: {
          value: sql`VALUES(value)`,
          when: sql`VALUES(\`when\`)`,
        },
      });

    // Step 9: Fetch updated data and return transformed results
    const newChartData = await db
      .select()
      .from(userChartDataTable)
      .where(eq(userChartDataTable.userId, input.userId))
      .orderBy(desc(userChartDataTable.updatedAt));

    return transformCharts(newChartData);
  });
