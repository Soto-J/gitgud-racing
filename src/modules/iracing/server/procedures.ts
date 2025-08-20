import { and, desc, eq, getTableColumns, gt } from "drizzle-orm";

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
  IracingSeriesResultsResponse,
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

  weeklySeriesResults: iracingProcedure.query(async () => {
    const weeklyResults = await db
      .select()
      .from(seriesWeeklyStatsTable)
      .orderBy(desc(seriesWeeklyStatsTable.averageEntrants));

    if (!weeklyResults) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No weekly results found",
      });
    }

    return weeklyResults;
  }),
});
