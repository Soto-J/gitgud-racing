import { DateTime } from "luxon";

import { desc, eq, count, sql } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, iracingProcedure } from "@/trpc/init";

import * as helper from "@/modules/iracing/server";
import {
  getUserWithRelations,
  isLicenseDataFresh,
  syncUserLicenseData,
  buildSeriesSearchClause,
  processChartDataForInsert,
  transformCharts,
  IRACING_CHART_TYPE_IRATING,
} from "./procedure-helpers";

import { IRacingUserChartDataResponse } from "@/modules/iracing/types";
import {
  IRacingGetUserInputSchema,
  IRacingGetUserRecentRacesInputSchema,
  IRacingGetUserSummaryInputSchema,
  IRacingUserChartDataInputSchema,
  IRacingWeeklySeriesResultsInputSchema,
} from "@/modules/iracing/schema";

import { db } from "@/db";
import {
  profileTable,
  seriesTable,
  seriesWeeklyStatsTable,
  userChartDataTable,
} from "@/db/schema";

import { categoryMap } from "@/modules/iracing/constants";

// =============================================================================
// USER PROCEDURES
// =============================================================================

/**
 * Fetches user data with license information, syncing from iRacing if needed
 */
const getUserProcedure = iracingProcedure
  .input(IRacingGetUserInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input?.userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "userId is required",
      });
    }

    const userData = await getUserWithRelations(input.userId);
    const custId = userData.profile?.iracingId;

    // Return cached data if no iRacing ID provided
    if (!custId) {
      return helper.buildUserProfile(userData);
    }

    // Check if license data needs refreshing
    if (isLicenseDataFresh(userData.licenses)) {
      return helper.buildUserProfile(userData);
    }

    // Sync fresh data from iRacing
    try {
      await syncUserLicenseData(custId, input.userId, ctx.iracingAuthCode);
      const updatedUserData = await getUserWithRelations(input.userId);
      return helper.buildUserProfile(updatedUserData);
    } catch (error) {
      console.error("Failed to sync license data:", error);
      return helper.buildUserProfile(userData);
    }
  });

/**
 * Fetches recent race data for a user from iRacing
 */
const getUserRecentRacesProcedure = iracingProcedure
  .input(IRacingGetUserRecentRacesInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    try {
      const recentRaces = await helper.fetchData({
        query: `/data/stats/member_recent_races?cust_id=${input.custId}`,
        authCode: ctx.iracingAuthCode,
      });

      return recentRaces || null;
    } catch (error) {
      console.error("Failed to fetch recent races:", error);
      return null;
    }
  });

/**
 * Fetches user summary statistics from iRacing
 */
const getUserSummaryProcedure = iracingProcedure
  .input(IRacingGetUserSummaryInputSchema)
  .query(async ({ ctx, input }) => {
    if (!input.custId) {
      return null;
    }

    try {
      const userSummary = await helper.fetchData({
        query: `/data/stats/member_summary?cust_id=${input.custId}`,
        authCode: ctx.iracingAuthCode,
      });

      return userSummary || null;
    } catch (error) {
      console.error("Failed to fetch user summary:", error);
      return null;
    }
  });

// =============================================================================
// CHART DATA PROCEDURES
// =============================================================================

/**
 * Fetches and caches user chart data (iRating history) from iRacing
 */
const userChartDataProcedure = iracingProcedure
  .input(IRacingUserChartDataInputSchema)
  .query(async ({ ctx, input }) => {
    // Get user's iRacing ID
    const userProfile = await db
      .select({ iracingId: profileTable.iracingId })
      .from(profileTable)
      .where(eq(profileTable.userId, input.userId))
      .then((val) => val[0]);

    if (!userProfile?.iracingId) {
      return null;
    }

    // Check cached data
    const chartData = await db
      .select()
      .from(userChartDataTable)
      .where(eq(userChartDataTable.userId, input.userId))
      .orderBy(desc(userChartDataTable.updatedAt));

    // Return cached data if fresh
    if (chartData.length > 0 && !helper.shouldRefreshChartData(chartData[0])) {
      return transformCharts(chartData);
    }

    // Fetch fresh data from iRacing
    try {
      const promiseArr = Object.keys(categoryMap).map((categoryId) =>
        helper.fetchData({
          query: `/data/member/chart_data?chart_type=${IRACING_CHART_TYPE_IRATING}&cust_id=${userProfile.iracingId}&category_id=${categoryId}`,
          authCode: ctx.iracingAuthCode,
        }),
      );

      const results = await Promise.allSettled(promiseArr);

      const failedResults = results.filter((res) => res.status === "rejected");
      if (failedResults.length > 0) {
        console.warn("Some chart data requests failed:", failedResults);
      }

      const data = results
        .filter((res) => res.status === "fulfilled")
        .map((res) => res.value) as IRacingUserChartDataResponse[];

      if (data.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chart data from iRacing API",
        });
      }

      // Process and insert data
      const dataToInsert = processChartDataForInsert(data, input.userId);

      await db
        .insert(userChartDataTable)
        .values(dataToInsert)
        .onDuplicateKeyUpdate({
          set: {
            value: sql`VALUES(value)`,
            updatedAt: DateTime.utc().toFormat("yyyy-MM-dd HH:mm:ss"),
          },
        });

      // Return fresh data
      const newChartData = await db
        .select()
        .from(userChartDataTable)
        .where(eq(userChartDataTable.userId, input.userId))
        .orderBy(desc(userChartDataTable.updatedAt));

      return transformCharts(newChartData);
    } catch (error) {
      console.error("Error refreshing chart data:", error);
      return null;
    }
  });

// =============================================================================
// SERIES PROCEDURES
// =============================================================================

/**
 * Fetches all available racing series
 */
const getAllSeriesProcedure = iracingProcedure.query(async () => {
  const allSeries = await db
    .select()
    .from(seriesTable)
    .orderBy(desc(seriesTable.seriesName));

  if (!allSeries?.length) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No series found",
    });
  }

  return allSeries;
});

/**
 * Fetches paginated weekly series results with search functionality
 */
const weeklySeriesResultsProcedure = iracingProcedure
  .input(IRacingWeeklySeriesResultsInputSchema)
  .query(async ({ input }) => {
    const { search, page, pageSize } = input;
    const searchClause = buildSeriesSearchClause(search);

    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .where(searchClause)
      .orderBy(
        desc(seriesWeeklyStatsTable.averageEntrants),
        desc(seriesWeeklyStatsTable.averageSplits),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    if (!weeklyResults?.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No weekly results found",
      });
    }

    const [total] = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(searchClause);

    const totalPages = Math.ceil(total.count / pageSize);

    return {
      series: weeklyResults,
      total: total.count,
      totalPages,
    };
  });

/**
 * Gets total page count for series results pagination
 */
const getTotalSeriesCountProcedure = iracingProcedure
  .input(
    IRacingWeeklySeriesResultsInputSchema.pick({
      search: true,
      pageSize: true,
    }),
  )
  .query(async ({ input }) => {
    const { search, pageSize } = input;
    const searchClause = buildSeriesSearchClause(search);

    const [total] = await db
      .select({ count: count() })
      .from(seriesWeeklyStatsTable)
      .where(searchClause);

    const totalPages = Math.ceil(total.count / pageSize);

    return { totalPages };
  });

/**
 * Utility procedure for fetching iRacing API documentation
 */
const getDocumentationProcedure = iracingProcedure.query(async ({ ctx }) => {
  return await helper.fetchData({
    query: `/data/doc`,
    authCode: ctx.iracingAuthCode,
  });
});

// =============================================================================
// ROUTER EXPORT
// =============================================================================

export const iracingRouter = createTRPCRouter({
  // User procedures
  getUser: getUserProcedure,
  getUserRecentRaces: getUserRecentRacesProcedure,
  getUserSummary: getUserSummaryProcedure,

  // Chart data procedures
  userChartData: userChartDataProcedure,

  // Series procedures
  getAllSeries: getAllSeriesProcedure,
  weeklySeriesResults: weeklySeriesResultsProcedure,
  getTotalSeriesCount: getTotalSeriesCountProcedure,

  // Utility procedures
  getDocumentation: getDocumentationProcedure,
});
