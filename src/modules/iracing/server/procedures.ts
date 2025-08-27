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
    .input(UserChartDataInputSchema)
    .query(async ({ ctx, input }) => {
      const chartData = await db
        .select()
        .from(userChartDataTable)
        .where(
          and(
            eq(userChartDataTable.userId, ctx.auth.user.id),
            eq(userChartDataTable.categoryId, input.categoryId),
            gt(
              userChartDataTable.updatedAt,
              DateTime.now().minus({ days: 7 }).toJSDate(),
            ),
          ),
        )
        .orderBy(desc(userChartDataTable.updatedAt));

      const shouldRefresh = helper.shouldRefreshChartData(chartData[0]);

      if (shouldRefresh) {
        const data = await helper.fetchData({
          query: "",
          authCode: ctx.iracingAuthCode,
        });
        // TODO: persist `data` into userChartDataTable
        return data;
      }

      return chartData;
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

// Might use for condidition checks

// function isMondayAfter8PM(date: DateTime): boolean {
//   return date.weekday === 1 && date.hour >= 20;
// }

// function needsRefresh(latestUpdatedAt: Date, nowEst: DateTime): boolean {
//   const mondayReleaseUtc = nowEst
//     .set({ weekday: 1, hour: 20, minute: 0, second: 0, millisecond: 0 })
//     .toUTC();

//   return DateTime.fromJSDate(latestUpdatedAt) < mondayReleaseUtc;
// }

// example:
// const shouldFetchFreshData =
//   chartData.length === 0 ||
//   (isMondayAfter8PM(estNow) &&
//    needsRefresh(chartData[0].updatedAt, estNow));
