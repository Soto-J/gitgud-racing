import { desc, eq, sql } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init";

import { db } from "@/db";
import { profileTable, userChartDataTable } from "@/db/schema";

import { fetchData } from "@/modules/iracing/server/api";

import {
  categoryMap,
  IRACING_CHART_TYPE_IRATING,
} from "@/modules/iracing/constants";

import {
  chartDataIsFresh,
  transformCharts,
  processChartDataForInsert,
} from "@/modules/iracing/server/procedures/user-chart-data/helper";
import {
  GetUserChartDataInput,
  GetUserChartDataResponse,
} from "./schema";

/**
 * Fetches and caches user chart data (iRating history) from iRacing
 */
export const userChartDataProcedure = iracingProcedure
  .input(GetUserChartDataInput)
  .query(async ({ ctx, input }) => {
    const userProfile = await db
      .select({ iracingId: profileTable.iracingId })
      .from(profileTable)
      .where(eq(profileTable.userId, input.userId))
      .then((row) => row[0]);

    if (!userProfile?.iracingId) {
      return null;
    }

    const chartData = await db
      .select()
      .from(userChartDataTable)
      .where(eq(userChartDataTable.userId, input.userId))
      .orderBy(desc(userChartDataTable.updatedAt));

    // Return cached data if fresh
    if (chartDataIsFresh(chartData[0])) {
      return transformCharts(chartData);
    }

    // Fetch fresh data from iRacing
    const promiseArr = Object.keys(categoryMap).map((categoryId) =>
      fetchData({
        query: `/data/member/chart_data?chart_type=${IRACING_CHART_TYPE_IRATING}&cust_id=${userProfile.iracingId}&category_id=${categoryId}`,
        authCode: ctx.iracingAuthCode,
      }),
    );

    const results = await Promise.allSettled(promiseArr);

    const failedResults = results.filter((res) => res.status === "rejected");
    
    if (failedResults.length > 0) {
      console.warn("Some chart data requests failed:", failedResults);
    }

    const res = results
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);

    if (res.length === 0) {
      return [];
    }

    const data = GetUserChartDataResponse.parse(res);

    // Process and insert data
    const dataToInsert = processChartDataForInsert(data, input.userId);

    await db
      .insert(userChartDataTable)
      .values(dataToInsert)
      .onDuplicateKeyUpdate({
        set: {
          value: sql`VALUES(value)`,
        },
      });

    // Return fresh data
    const newChartData = await db
      .select()
      .from(userChartDataTable)
      .where(eq(userChartDataTable.userId, input.userId))
      .orderBy(desc(userChartDataTable.updatedAt));

    return transformCharts(newChartData);
  });
