import { DateTime } from "luxon";

import { like, desc, eq, getTableColumns, or } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import * as helper from "@/modules/iracing/server";

import {
  IRacingChartDataRecord,
  IRacingMemberData,
  IRacingUserChartDataResponse,
} from "@/modules/iracing/types";

import { db } from "@/db";
import {
  licenseTable,
  profileTable,
  seriesWeeklyStatsTable,
  user,
} from "@/db/schema";

import { categoryMap, chartTypeMap } from "@/modules/iracing/constants";

// =============================================================================
// CONSTANTS
// =============================================================================

export const CACHE_DURATION_HOURS = 24;
export const IRACING_CHART_TYPE_IRATING = 1;

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Fetches user data with joined profile and license information
 * 
 * @param userId - The user ID to fetch data for
 * @returns Promise resolving to user data with joined profile and licenses
 * @throws TRPCError if user is not found
 * 
 * @example
 * ```typescript
 * const userData = await getUserWithRelations("user_123");
 * console.log(userData.user.name, userData.profile?.iracingId);
 * ```
 */
export async function getUserWithRelations(userId: string) {
  const result = await db
    .select({
      user: { ...getTableColumns(user) },
      profile: { ...getTableColumns(profileTable) },
      licenses: { ...getTableColumns(licenseTable) },
    })
    .from(user)
    .leftJoin(profileTable, eq(profileTable.userId, user.id))
    .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
    .where(eq(user.id, userId))
    .then((rows) => rows[0]);

  if (!result?.user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return result;
}

/**
 * Syncs user license data from iRacing API to the database
 * 
 * @param custId - The customer ID from iRacing
 * @param userId - The internal user ID
 * @param authCode - Valid iRacing authentication token
 * 
 * @example
 * ```typescript
 * await syncUserLicenseData("12345", "user_123", authToken);
 * ```
 */
export async function syncUserLicenseData(
  custId: string,
  userId: string,
  authCode: string
): Promise<void> {
  const iRacingUserData = (await helper.fetchData({
    query: `/data/member/get?cust_ids=${custId}&include_licenses=true`,
    authCode,
  })) as IRacingMemberData;

  if (!iRacingUserData?.members?.[0]?.licenses) {
    return;
  }

  const apiLicenses = iRacingUserData.members[0].licenses;
  const transformedData = helper.mapIRacingLicensesToDb(apiLicenses);

  await db
    .insert(licenseTable)
    .values({
      ...transformedData,
      userId,
    })
    .onDuplicateKeyUpdate({
      set: { ...transformedData },
    });
}

// =============================================================================
// VALIDATION & LOGIC HELPERS  
// =============================================================================

/**
 * Determines if license data is still fresh and doesn't need refreshing
 * 
 * @param licenses - License data with updatedAt timestamp
 * @returns true if data is fresh and valid, false if needs refreshing
 * 
 * @example
 * ```typescript
 * const isFresh = isLicenseDataFresh(userData.licenses);
 * if (!isFresh) {
 *   await syncUserLicenseData(custId, userId, authCode);
 * }
 * ```
 */
export function isLicenseDataFresh(licenses: { updatedAt?: string | Date | null } | null): boolean {
  if (!licenses?.updatedAt) return false;

  const updatedAtStr = typeof licenses.updatedAt === 'string' 
    ? licenses.updatedAt 
    : licenses.updatedAt.toISOString();

  const lastSync = DateTime.fromFormat(
    updatedAtStr,
    "yyyy-MM-dd HH:mm:ss",
    { zone: "utc" }
  );

  const hoursSinceSync = DateTime.utc().diff(lastSync, "hours").hours;
  return hoursSinceSync < CACHE_DURATION_HOURS;
}

/**
 * Builds search clause for series filtering by name or track
 * 
 * @param search - Search term (can be null/undefined for no filtering)
 * @returns Drizzle ORM where clause or undefined for no filtering
 * 
 * @example
 * ```typescript
 * const whereClause = buildSeriesSearchClause("Formula");
 * const results = await db.select().from(seriesTable).where(whereClause);
 * ```
 */
export function buildSeriesSearchClause(search: string | null | undefined) {
  return search
    ? or(
        like(seriesWeeklyStatsTable.name, `%${search}%`),
        like(seriesWeeklyStatsTable.trackName, `%${search}%`)
      )
    : undefined;
}

// =============================================================================
// DATA PROCESSING HELPERS
// =============================================================================

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
  data: IRacingUserChartDataResponse[],
  userId: string
) {
  return data.flatMap((res) =>
    res.data
      .filter((d) => {
        if (d.when === null || d.when === undefined) return false;
        const testDate = new Date(d.when);
        return !isNaN(testDate.getTime());
      })
      .map((d) => {
        const when = DateTime.fromJSDate(new Date(d.when)).toISODate();
        return {
          userId,
          categoryId: res.category_id,
          category: categoryMap[res.category_id as keyof typeof categoryMap],
          chartTypeId: res.chart_type,
          chartType: chartTypeMap[res.chart_type as keyof typeof chartTypeMap],
          when: when!,
          value: d.value,
        };
      })
  );
}

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
export function transformCharts(charts: IRacingChartDataRecord[]) {
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
        chartData: IRacingChartDataRecord[];
      }
    >
  );
}