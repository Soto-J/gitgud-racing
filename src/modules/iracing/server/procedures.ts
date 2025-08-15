import { eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { license, profile, user } from "@/db/schema";

import {
  createTRPCRouter,
  iracingProcedure,
  syncIracingProfileProcedure,
} from "@/trpc/init";

import {
  GetSeasonInputSchema,
  GetUserInputSchema,
} from "@/modules/iracing/schema";

import * as helper from "@/modules/iracing/server/helper";

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
            id: profile.id,
            iracingId: profile.iracingId,
            discord: profile.discord,
            team: profile.team,
            bio: profile.bio,
            isActive: profile.isActive,
          },
          licenses: { ...getTableColumns(license) },
        })
        .from(user)
        .innerJoin(profile, eq(profile.userId, user.id))
        .leftJoin(license, eq(license.userId, user.id))
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

  getSeasons: iracingProcedure
    .input(GetSeasonInputSchema)
    .query(async ({ ctx, input }) => {
      const seasonListURL = `/data/season/list?season_year=${input.seasonYear}&season_quarter=${input.seasonQuarter}`;

      const data = await helper.fetchData({
        query: seasonListURL,
        authCode: ctx.iracingAuthCode,
      });
    }),

  getSeries: iracingProcedure.query(async ({ ctx, input }) => {}),
});
