import { fetchData } from "@/lib/iracing/helpers/fetch-data";

import { CATEGORY_IDS, CHART_TYPE_IRATING } from "@/lib/iracing/constants";

import type { ChartDataResponse } from "./types";
import { ChartDataResponseSchema } from "./types/schema";

export async function fetchMemberChartData(
  custId: string,
  accessToken: string,
): Promise<ChartDataResponse> {
  const promises = CATEGORY_IDS.map((categoryId) =>
    fetchData(
      `/data/member/chart_data?cust_id=${custId}&category_id=${categoryId}&chart_type=${CHART_TYPE_IRATING}`,
      accessToken,
    ),
  );

  const results = await Promise.allSettled(promises);

  const failedResults = results.filter(
    (res) =>
      res.status === "rejected" ||
      (res.status === "fulfilled" && res.value.ok === false),
  );

  if (failedResults.length > 0) {
    console.warn(
      "[MemberChartData] Some chart data requests failed:",
      failedResults,
    );
  }

  const payload = results
    .filter(
      (res): res is PromiseFulfilledResult<{ ok: true; data: unknown }> =>
        res.status === "fulfilled" && res.value.ok === true,
    )
    .map((res) => res.value.data);

  return ChartDataResponseSchema.parse(payload);
}
