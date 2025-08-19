import { and, eq, getTableColumns, gt } from "drizzle-orm";

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
} from "@/db/schema";

import {
  GetAllSeriesInputSchema,
  GetUserInputSchema,
} from "@/modules/iracing/schema";

import * as helper from "@/modules/iracing/server/helper";

import {
  IracingGetAllSeriesResponse,
  IracingGetSeriesResultsResponse,
} from "../types";

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

  // Returns all series from a year and quarter
  getAllSeries: iracingProcedure
    .input(GetAllSeriesInputSchema)
    .query(async ({ ctx, input }) => {
      const { include_series, season_year, season_quarter } = input;

      const data: IracingGetSeriesResultsResponse[] = await helper.fetchData({
        query: `/data/series/seasons?include_series=${include_series}&season_year=${season_year}&season_quarter=${season_quarter}`,
        authCode: ctx.iracingAuthCode,
      });

      return await db.select().from(seriesTable);
    }),

  getSeriesResults: iracingProcedure
    .input(GetSeriesResultsInputSchema)
    .query(async ({ ctx, input }) => {
      // Updates every 7 days
      const weeklyResults = await db
        .select()
        .from(seriesWeeklyStatsTable)
        .where(
          gt(
            seriesWeeklyStatsTable.updatedAt,
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          ),
        );

      // if weekly results are valid
      if (weeklyResults.length > 0) {
        console.log("Using cached weekly results.");
        return weeklyResults;
      }

      console.log("Refreshing weekly results.");

      const paramsArr = ["/data/results/search_series"];
      Object.entries(input).forEach(([key, value]) => {
        if (value) {
          paramsArr.push(`&${key}=${value}`);
        }
      });
      const allSeries = await db.select().from(seriesTable);
      const params = paramsArr.join("");

      const fetchArr = allSeries.map((series) =>
        helper.fetchData({
          query: params + `&series_id=${series.seriesId}`,
          authCode: ctx.iracingAuthCode,
        }),
      );

      const results = await Promise.allSettled(fetchArr);

      const successfulResults: IracingGetSeriesResultsResponse[][] = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      const updateWeeklySeries = successfulResults
        .filter((series) => series.length > 0)
        .map((series) => {
          // Group by start_time to count unique races
          const uniqueRaces = new Set(series.map((split) => split.start_time))
            .size;

          const avgSplitsPerRace = series.length / uniqueRaces;

          const totalDrivers = series.reduce(
            (total, split) => total + split.num_drivers,
            0,
          );

          const avgEntrants =
            Math.round((totalDrivers / series.length) * 100) / 100; // Round to 2 decimal

          return db
            .insert(seriesWeeklyStatsTable)
            .values({
              seriesId: series[0].series_id.toString(),
              seasonYear: series[0].season_year,
              seasonQuarter: series[0].season_quarter,
              raceWeekNum: series[0].race_week_num,
              averageEntrants: avgEntrants.toFixed(5),
              averageSplits: avgSplitsPerRace.toFixed(5),
              totalSplits: series.length,
            })
            .onDuplicateKeyUpdate({ set: {} });
        });

      await Promise.all(updateWeeklySeries);

      return successfulResults;
    }),

  seriesWeeklyResults: iracingProcedure.query(async () => {
    return await db.select().from(seriesWeeklyStatsTable);
  }),
});
