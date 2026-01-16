import { desc, eq, sql } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, userChartDataTable } from "@/db/schemas";

import { fetchIracingData } from "@/modules/iracing/server/api";

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

export const userChartDataProcedure = iracingProcedure
  .input(UserChartDataInputSchema)
  .query(async ({ ctx, input }) => {
    // Get user's iRacing ID from their profile
    // const userProfile = await db
    //   .select({ iracingId: profileTable.iracingId })
    //   .from(profileTable)
    //   .where(eq(profileTable.userId, input.userId))
    //   .then((row) => row[0]);

    // if (!userProfile?.iracingId) {
    //   return null;
    // }

    // Check existing cached chart data
    // const chartData = await db
    //   .select()
    //   .from(userChartDataTable)
    //   .where(eq(userChartDataTable.userId, input.userId))
    //   .orderBy(desc(userChartDataTable.updatedAt));

    // Return cached data if it's fresh (updated after last reset)
    // if (chartDataIsFresh(chartData[0])) {
    //   return transformCharts(chartData);
    // }

    // Fetch fresh data from iRacing API for all racing categories
    const promiseArr = Object.keys(categoryMap).map((categoryId) =>
      fetchIracingData(
        `/data/member/chart_data?chart_type=${IRACING_CHART_TYPE_IRATING}&cust_id=${input.userId}&category_id=${categoryId}`,
        ctx.iracingAccessToken,
      ),
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
