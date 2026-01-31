

import { categoryMap, chartTypeMap } from "@/modules/iracing/constants";

import { UserChartDataTable } from "@/db/schemas/type";
import { ChartData, UserChartDataResponse } from "./types";

/**
 * Determines if chart data is fresh based on iRacing's weekly reset schedule
 *
 * iRacing resets weekly data every Monday at 8 PM UTC. This function checks
 * if the provided chart data was updated after the most recent reset time.
 *
 * @param latestRecord - The most recent chart data record to check
 * @returns True if the data was updated after the last Monday 8 PM reset
 *
 * @example
 * ```typescript
 * const userChartData = await getUserLatestChartData(userId);
 *
 * if (!chartDataIsFresh(userChartData)) {
 *   // Data is stale, fetch fresh data from iRacing API
 *   await refreshUserChartData(userId);
 * }
 * ```
 */
// export const chartDataIsFresh = (
//   latestRecord: ChartData | undefined | null,
// ): boolean => {
//   // This week's Monday 8 PM UTC
//   let reset = DateTime.now().startOf("week").plus({ hours: 20 });

//   // If it's before Monday 8 PM, roll back to last week's reset
//   if (DateTime.now() < reset) {
//     reset = reset.minus({ weeks: 1 });
//   }

//   return latestRecord?.updatedAt
//     ? DateTime.fromJSDate(latestRecord.updatedAt) > reset
//     : false;
// };

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
export function transformCharts(charts: UserChartDataTable[]) {
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
        chartData: UserChartDataTable[];
      }
    >,
  );
}

/**
 * Processes and validates chart data from iRacing API for database insertion
 *
 * Takes raw chart data from the iRacing API and transforms it into a format
 * suitable for database insertion. Filters out invalid entries and enriches
 * data with category and chart type mappings.
 *
 * @param data - Raw chart data response from iRacing API containing multiple chart types
 * @param userId - User ID to associate with all chart data records
 * @returns Flattened array of chart data records ready for database insertion
 *
 * @example
 * ```typescript
 * // Fetch raw data from iRacing API
 * const apiResponse = await fetchChartData(custId, authCode);
 *
 * // Process for database insertion
 * const processedData = buildChartData(apiResponse, userId);
 *
 * // Insert into database
 * await db.insert(userChartDataTable).values(processedData);
 * ```
 *
 * @remarks
 * - Filters out records where `when` field is null or undefined
 * - Maps category IDs to human-readable category names
 * - Maps chart type IDs to descriptive chart type names
 * - Spreads all original data fields while adding enriched metadata
 */
export function buildChartData(data: UserChartDataResponse, userId: string) {
  return data.flatMap((res) =>
    res.data
      .filter((d) => d.when !== null && d.when !== undefined)
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
