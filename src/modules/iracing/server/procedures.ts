import { and, eq, getTableColumns, gt } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  iracingProcedure,
  syncIracingProfileProcedure,
} from "@/trpc/init";

import { db } from "@/db";
import { licenseTable, profileTable, seriesTable, user } from "@/db/schema";

import {
  GetAllSeriesInputSchema,
  GetSeriesResultsInputSchema,
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

      const cachedSeries = await db
        .select()
        .from(seriesTable)
        .where(
          and(
            eq(seriesTable.seasonYear, parseInt(season_year)),
            eq(seriesTable.seasonQuarter, parseInt(season_quarter)),
            gt(
              seriesTable.updatedAt,
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ), // 7 days
          ),
        );

      if (cachedSeries.length > 0) {
        return cachedSeries;
      }

      const data: IracingGetAllSeriesResponse = await helper.fetchData({
        query: `/data/series/seasons?include_series=${include_series}&season_year=${season_year}&season_quarter=${season_quarter}`,
        authCode: ctx.iracingAuthCode,
      });

      await Promise.all(
        data.map((item) =>
          db
            .insert(seriesTable)
            .values({
              seriesId: item.series_id.toString(),
              seasonId: item.season_id.toString(),
              seasonYear: item.season_year,
              seasonQuarter: item.season_quarter,
              category: item.schedules[0].category,
              seriesName: item.schedules[0].schedule_name,
              licenseGroup: item.license_group,
              fixedSetup: item.fixed_setup,
            })
            .onDuplicateKeyUpdate({
              set: {},
            }),
        ),
      );

      return await db.select().from(seriesTable);
    }),

  getSeriesResults: iracingProcedure
    .input(GetSeriesResultsInputSchema)
    .query(async ({ ctx, input }) => {
      const params = ["/data/results/search_series"];

      Object.entries(input).forEach(([key, value]) => {
        if (value) {
          params.push(`&${key}=${value}`);
        }
      });
      
      const data: IracingGetSeriesResultsResponse = await helper.fetchData({
        query: params.join(""),
        authCode: ctx.iracingAuthCode,
      });
    }),
});
