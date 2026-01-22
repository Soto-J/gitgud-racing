import { eq, and } from "drizzle-orm";

import { iracingProcedure } from "@/trpc/init/iracing-procedure";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";
import {
  UserChartDataInputSchema,
  UserChartDataResponseSchema,
} from "./types/schema";

import { fetchIracingData } from "@/modules/iracing/server/api";

import { categoryMap, CHART_TYPE_IRATING } from "@/modules/iracing/constants";

export const chartDataProcedure = iracingProcedure
  .input(UserChartDataInputSchema)
  .query(async ({ ctx, input }) => {
    const [account] = await db
      .select({ custId: accountTable.accountId })
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, input.userId),
          eq(accountTable.providerId, "iracing"),
        ),
      );

    const promiseArr = Object.keys(categoryMap).map((categoryId) =>
      fetchIracingData(
        `/data/member/chart_data?cust_id=${account.custId}&category_id=${categoryId}&chart_type=${CHART_TYPE_IRATING}`,
        ctx.iracingAccessToken,
      ),
    );

    const results = await Promise.allSettled(promiseArr);
    console.log("Result: ", results);

    const failedResults = results.filter((res) => res.status === "rejected");

    if (failedResults.length > 0) {
      console.warn("Some chart data requests failed:", failedResults);
    }

    const payload = results
      .filter(
        (res): res is PromiseFulfilledResult<{ ok: true; data: unknown }> =>
          res.status === "fulfilled" && res.value.ok === true,
      )
      .map((res) => res.value.data);

    const data = UserChartDataResponseSchema.parse(payload);

    return data.map((chart) => ({
      ...chart,
      categoryId: chart.category_id,
      chartType: chart.chart_type,
    }));
  });
