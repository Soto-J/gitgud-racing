import { DateTime } from "luxon";

import {
  like,
  desc,
  eq,
  getTableColumns,
  or,
  count,
  and,
  gt,
  asc,
} from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  iracingProcedure,
  syncIracingProfileProcedure,
} from "@/trpc/init";

import { db } from "@/db";
import {
  licenseTable,
  profileTable,
  seriesTable,
  seriesWeeklyStatsTable,
  user,
  userChartDataTable,
} from "@/db/schema";

import {
  GetUserInputSchema,
  UserChartDataInputSchema,
} from "@/modules/iracing/schema";

import * as helper from "@/modules/iracing/server";

import { WeeklySeriesResultsInput } from "@/modules/home/schemas";
import z from "zod";
import { ChartDataRecord, UserChartDataResponse } from "../types";
import { categoryMap, chartTypeMap } from "../constants";

export const iracingRouter = createTRPCRouter({
  getDocumentation: iracingProcedure.query(async ({ ctx }) => {
    return await helper.fetchData({
      query: `/data/doc`,
      authCode: ctx.iracingAuthCode,
    });
  }),

  getUser: syncIracingProfileProcedure
    .input(GetUserInputSchema)
    .query(async ({ input }) => {
      if (!input?.userId) {
        console.error({ code: "NOT_FOUND", message: "userId not found" });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "userId not found",
        });
      }

      const result = await db
        .select({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          profile: {
            id: profileTable.id,
            iracingId: profileTable.iracingId,
            discord: profileTable.discord,
            team: profileTable.team,
            bio: profileTable.bio,
            isActive: profileTable.isActive,
          },
          licenses: { ...getTableColumns(licenseTable) },
        })
        .from(user)
        .innerJoin(profileTable, eq(profileTable.userId, user.id))
        .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
        .where(eq(user.id, input.userId))
        .then((value) => value[0]);

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const member = helper.transformLicenses(result);

      return {
        isError: false,
        error: null,
        message: "User found",
        member,
      };
    }),

  getAllSeries: iracingProcedure.query(async ({ ctx, input }) => {
    const allSeries = await db
      .select()
      .from(seriesTable)
      .orderBy(desc(seriesTable.seriesName));

    if (!allSeries) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No series found",
      });
    }
  }),

  userChartData: iracingProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Use authenticated user ID, ignore input.userId for security
      const userId = ctx.auth.user.id;

      // First, get the user's profile
      const profile = await db
        .select({ iracingId: profileTable.iracingId })
        .from(profileTable)
        .where(eq(profileTable.userId, input.userId))
        .then((val) => val[0]);

      if (!profile?.iracingId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const chartData = await db
        .select()
        .from(userChartDataTable)
        .where(
          and(
            eq(userChartDataTable.userId, userId),
            gt(
              userChartDataTable.updatedAt,
              DateTime.now().minus({ days: 7 }).toJSDate(),
            ),
          ),
        )
        .orderBy(desc(userChartDataTable.updatedAt));

      const shouldRefresh =
        helper.shouldRefreshChartData(chartData[0]) || chartData.length === 0;
    
      if (!shouldRefresh) {
        return transformCharts(chartData);
      }

      try {
        const promiseArr = Object.keys(categoryMap)
          .slice(0, 1)
          .map((categoryId) =>
            helper.fetchData({
              query: `/data/member/chart_data?chart_type=1&cust_id=${profile.iracingId}&category_id=${categoryId}`,
              authCode: ctx.iracingAuthCode,
            }),
          );

        const results = await Promise.allSettled(promiseArr);
        const failedResults = results.filter(
          (res) => res.status === "rejected",
        );

        if (failedResults.length > 0) {
          console.warn("Some chart data requests failed:", failedResults);
        }

        const data = results
          .filter((res) => res.status === "fulfilled")
          .map((res) => res.value) as UserChartDataResponse[];

        if (data.length === 0) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch chart data from iRacing API",
          });
        }

        const dataToInsert = data.flatMap((res) =>
          res.data.map((d) => ({
            userId: userId,
            categoryId: res.category_id,
            category: categoryMap[res.category_id as keyof typeof categoryMap],
            chartTypeId: res.chart_type,
            chartType:
              chartTypeMap[res.chart_type as keyof typeof chartTypeMap],
            ...d, // spread fields from each object inside res.data
          })),
        );
        console.log({ dataToInsert });
        if (dataToInsert.length > 0) {
          // await db.insert(userChartDataTable).values(dataToInsert);
          return;
        }

        // Return the newly inserted data in the same format as cached data
        const newChartData = await db
          .select()
          .from(userChartDataTable)
          .where(eq(userChartDataTable.userId, userId))
          .orderBy(desc(userChartDataTable.updatedAt));

        return transformCharts(newChartData);
      } catch (error) {
        console.error("Error refreshing chart data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to refresh chart data",
        });
      }
    }),

  weeklySeriesResults: iracingProcedure
    .input(WeeklySeriesResultsInput)
    .query(async ({ input }) => {
      const { search, page, pageSize } = input;

      const orClause = search
        ? or(
            like(seriesWeeklyStatsTable.name, `%${search}%`),
            like(seriesWeeklyStatsTable.trackName, `%${search}%`),
          )
        : undefined;

      const weeklyResults = await db
        .select()
        .from(seriesWeeklyStatsTable)
        .where(orClause)
        .orderBy(
          desc(seriesWeeklyStatsTable.averageEntrants),
          desc(seriesWeeklyStatsTable.averageSplits),
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      if (!weeklyResults) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No weekly results found",
        });
      }

      const [total] = await db
        .select({ count: count() })
        .from(seriesWeeklyStatsTable)
        .where(orClause);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        series: weeklyResults,
        total: total.count,
        totalPages,
      };
    }),

  getTotalSeriesCount: iracingProcedure
    .input(
      WeeklySeriesResultsInput.pick({
        search: true,
        pageSize: true,
      }),
    )
    .query(async ({ input }) => {
      const { search, pageSize } = input;
      const orClause = search
        ? or(
            like(seriesWeeklyStatsTable.name, `%${search}%`),
            like(seriesWeeklyStatsTable.trackName, `%${search}%`),
          )
        : undefined;

      const [total] = await db
        .select({ count: count() })
        .from(seriesWeeklyStatsTable)
        .where(orClause);

      const totalPages = Math.ceil(total.count / pageSize);

      return { totalPages };
    }),
});

const transformCharts = (charts: ChartDataRecord[]) => {
  if (!charts || charts.length === 0) {
    return {};
  }

  return charts.reduce(
    (acc, chart) => {
      const category = chart.category;

      if (!acc[category]) {
        acc[category] = {
          discipline: category,
          chartData: [],
          tabValue: category.toLowerCase().replace(/\s+/g, "-"),
        };
      }

      acc[category].chartData.push(chart);
      return acc;
    },
    {} as Record<
      string,
      {
        discipline: string;
        chartData: ChartDataRecord[];
        tabValue: string;
      }
    >,
  );
};
