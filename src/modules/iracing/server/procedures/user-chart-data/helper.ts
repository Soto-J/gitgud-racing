import { DateTime } from "luxon";

import { categoryMap, chartTypeMap } from "@/modules/iracing/constants";

import {
  UserChartData,
  IRacingUserChartDataResponse,
} from "@/modules/iracing/server/procedures/user-chart-data/schema";

export const chartDataIsFresh = (
  latestRecord: UserChartData | undefined | null,
): boolean => {
  // This week's Monday 8 PM
  let reset = DateTime.now().startOf("week").plus({ hours: 20 });

  // If it's before Monday 8 PM, roll back to last week
  if (DateTime.now() < reset) {
    reset = reset.minus({ weeks: 1 });
  }

  return latestRecord?.updatedAt
    ? DateTime.fromJSDate(latestRecord.updatedAt) > reset
    : false;
};

/**
 * Transforms chart data records into grouped format by racing discipline
 *
 * Groups chart data by discipline (Oval, Sports, Formula, etc.) for
 * easier consumption by frontend components. Handles the special case
 * where "Sport" category is renamed to "Sports" for consistency.
 *
 * @param charts - Array of chart data records from database
 * @returns Object with disciplines as keys and chart data arrays as values
 *
 * @example
 * ```typescript
 * const chartData = await fetchUserChartData(userId);
 * const groupedData = transformCharts(chartData);
 *
 * // Result structure:
 * // {
 * //   "Oval": { discipline: "Oval", chartData: [...] },
 * //   "Sports": { discipline: "Sports", chartData: [...] },
 * //   "Formula": { discipline: "Formula", chartData: [...] }
 * // }
 * ```
 */
export function transformCharts(charts: UserChartData[]) {
  if (!charts || charts.length === 0) {
    return {};
  }

  return charts.reduce(
    (acc, chart) => {
      const discipline =
        chart.category.toLowerCase() === "sport" ? "Sports" : chart.category;

      if (!acc[discipline]) {
        acc[discipline] = {
          discipline,
          chartData: [],
        };
      }

      acc[discipline].chartData.push(chart);
      return acc;
    },
    {} as Record<
      string,
      {
        discipline: string;
        chartData: UserChartData[];
      }
    >,
  );
}

/**
 * Processes and validates chart data from iRacing API for database insertion
 *
 * Filters out invalid date entries and transforms the data structure
 * for database compatibility while preserving all necessary metadata.
 *
 * @param data - Raw chart data response from iRacing API
 * @param userId - User ID to associate with the chart data
 * @returns Processed array ready for database insertion
 *
 * @example
 * ```typescript
 * const apiData = await fetchChartData(custId, authCode);
 * const processedData = processChartDataForInsert(apiData, userId);
 * await db.insert(userChartDataTable).values(processedData);
 * ```
 */
export function processChartDataForInsert(
  data: IRacingUserChartDataResponse,
  userId: string,
) {
  return data.flatMap((res) =>
    res.data
      .filter((d) => d.when !== null || d.when !== undefined)
      .map((d) => {
        return {
          userId,
          categoryId: res.category_id,
          category: categoryMap[res.category_id as keyof typeof categoryMap],
          chartTypeId: res.chart_type,
          chartType: chartTypeMap[res.chart_type as keyof typeof chartTypeMap],
          ...d,
        };
      }),
  );
}
