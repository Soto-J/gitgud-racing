import z from "zod";

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
  sql,
} from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, iracingProcedure } from "@/trpc/init";

import * as helper from "@/modules/iracing/server";

import {
  ChartDataRecord,
  IRacingFetchResult,
  UserChartDataResponse,
} from "../types";
import { GetUserInputSchema } from "@/modules/iracing/schema";
import { WeeklySeriesResultsInput } from "@/modules/home/schemas";

import { db } from "@/db";
import {
  licenseTable,
  profileTable,
  seriesTable,
  seriesWeeklyStatsTable,
  user,
  userChartDataTable,
} from "@/db/schema";

import { categoryMap, chartTypeMap } from "../constants";

export const iracingRouter = createTRPCRouter({
  getDocumentation: iracingProcedure.query(async ({ ctx }) => {
    return await helper.fetchData({
      query: `/data/doc`,
      authCode: ctx.iracingAuthCode,
    });
  }),

  getUser: iracingProcedure
    .input(GetUserInputSchema)
    .query(async ({ ctx, input }) => {
      if (!input?.userId) {
        console.error({ code: "NOT_FOUND", message: "userId not found" });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "userId not found",
        });
      }

      const firstResult = await db
        .select({
          user: { ...getTableColumns(user) },
          profile: { ...getTableColumns(profileTable) },
          licenses: { ...getTableColumns(licenseTable) },
        })
        .from(user)
        .leftJoin(profileTable, eq(profileTable.userId, user.id))
        .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
        .where(eq(user.id, input.userId))
        .then((rows) => rows[0]);

      if (!firstResult.user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const custId = firstResult.profile?.iracingId;

      if (!custId) {
        // User has not input an ID
        console.log("No cust_id provided for user");
        return helper.buildUserProfile(firstResult);
      }

      const lastSync =
        firstResult.licenses?.updatedAt &&
        DateTime.fromFormat(
          firstResult.licenses.updatedAt,
          "yyyy-MM-dd HH:mm:ss",
          {
            zone: "utc",
          },
        );

      const hoursSinceSync = lastSync
        ? DateTime.utc().diff(lastSync, "hours").hours
        : 999;

      const dataIsFresh = lastSync && hoursSinceSync < 24;
      if (dataIsFresh) {
        // Data has not expired
        console.log("Using cached license data");
        return helper.buildUserProfile(firstResult);
      }

      console.log("Syncing fresh license data from iRacing");
      const iRacingUserData = (await helper.fetchData({
        query: `/data/member/get?cust_ids=${custId}&include_licenses=true`,
        authCode: ctx.iracingAuthCode,
      })) as IRacingFetchResult;

      if (!iRacingUserData) {
        return helper.buildUserProfile(firstResult);
      }

      const apiLicenses = iRacingUserData.members?.[0].licenses;

      const transformedData = helper.mapIRacingLicensesToDb(apiLicenses);

      const updateDbResult = await db
        .insert(licenseTable)
        .values({
          ...transformedData,
          userId: input.userId,
        })
        .onDuplicateKeyUpdate({
          set: { ...transformedData },
        })
        .$returningId();

      if (!updateDbResult) {
        console.log("Could not update user profile");
        return helper.buildUserProfile(firstResult);
      }

      const updatedResult = await db
        .select({
          user: { ...getTableColumns(user) },
          profile: { ...getTableColumns(profileTable) },
          licenses: { ...getTableColumns(licenseTable) },
        })
        .from(user)
        .leftJoin(profileTable, eq(profileTable.userId, user.id))
        .leftJoin(licenseTable, eq(licenseTable.userId, user.id))
        .where(eq(user.id, input.userId))
        .then((rows) => rows[0]);

      return helper.buildUserProfile(updatedResult);
    }),

  getAllSeries: iracingProcedure.query(async () => {
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
      const userProfile = await db
        .select({ iracingId: profileTable.iracingId })
        .from(profileTable)
        .where(eq(profileTable.userId, input.userId))
        .then((val) => val[0]);

      if (!userProfile?.iracingId) {
        console.error("No cust_id");
        return null;
      }

      const chartData = await db
        .select()
        .from(userChartDataTable)
        .where(eq(userChartDataTable.userId, input.userId))
        .orderBy(desc(userChartDataTable.updatedAt));

      // Check if we need to refresh chart data based on iRacing's schedule
      if (
        chartData.length > 0 &&
        !helper.shouldRefreshChartData(chartData[0])
      ) {
        console.log("Using cached chartData");
        return transformCharts(chartData);
      }

      try {
        const promiseArr = Object.keys(categoryMap).map((categoryId) =>
          helper.fetchData({
            query: `/data/member/chart_data?chart_type=1&cust_id=${userProfile.iracingId}&category_id=${categoryId}`,
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
          res.data
            .filter((d) => {
              if (d.when === null || d.when === undefined) return false;
              const testDate = new Date(d.when);
              return !isNaN(testDate.getTime()); // Valid date
            })
            .map((d) => {
              const when = DateTime.fromJSDate(new Date(d.when)).toISODate();
              return {
                userId: input.userId,
                categoryId: res.category_id,
                category:
                  categoryMap[res.category_id as keyof typeof categoryMap],
                chartTypeId: res.chart_type,
                chartType:
                  chartTypeMap[res.chart_type as keyof typeof chartTypeMap],
                when: when!,
                value: d.value,
              };
            }),
        );

        await db
          .insert(userChartDataTable)
          .values(dataToInsert)
          .onDuplicateKeyUpdate({
            set: {
              value: sql`VALUES(value)`,
              updatedAt: DateTime.utc().toFormat("yyyy-MM-dd HH:mm:ss"),
            },
          });

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

      const [total] = await db
        .select({ count: count() })
        .from(seriesWeeklyStatsTable)
        .where(
          search
            ? or(
                like(seriesWeeklyStatsTable.name, `%${search}%`),
                like(seriesWeeklyStatsTable.trackName, `%${search}%`),
              )
            : undefined,
        );

      const totalPages = Math.ceil(total.count / pageSize);

      return { totalPages };
    }),
});

const transformCharts = (charts: ChartDataRecord[]) => {
  if (!charts || charts.length === 0) {
    return {};
  }

  const grouped = charts.reduce(
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
        chartData: ChartDataRecord[];
      }
    >,
  );

  return grouped;
};
