import { like, desc, eq, getTableColumns, or, count, and } from "drizzle-orm";

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

import { GetUserInputSchema } from "@/modules/iracing/schema";

import * as helper from "@/modules/iracing/server/helper";

import { WeeklySeriesResultsInput } from "@/modules/home/schemas";
import z from "zod";

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
    .input(z.object({ custId: z.string(), categoryId: z.int() }))
    .query(async ({ ctx, input }) => {
      const chartData = await db
        .select()
        .from(userChartDataTable)
        .where(
          and(
            eq(userChartDataTable.userId, ctx.auth.user.id),
            eq(userChartDataTable.categoryId, input.categoryId),
          ),
        );

      return;
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
