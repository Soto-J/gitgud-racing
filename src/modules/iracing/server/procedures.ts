import z from "zod";

import { eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { IRACING_URL } from "@/constants";

import { db } from "@/db";
import { license, profile, user } from "@/db/schema";

import {
  createTRPCRouter,
  iracingProcedure,
  syncIracingProfileProcedure,
} from "@/trpc/init";

import * as helper from "@/modules/iracing/server/helper";

export const iracingRouter = createTRPCRouter({
  getDocumentation: iracingProcedure.query(async ({ ctx }) => {
    return await helper.fetchData({
      query: `/data/doc`,
      authCode: ctx.iracingAuthCode,
    });
  }),

  getUser: syncIracingProfileProcedure
    .input(
      z.object({
        userId: z.string().nullish(),
      }),
    )
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
    .input(
      z.object({
        seasonYear: z.string(),
        seasonQuarter: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const seasonListURL = `${IRACING_URL}/data/season/list?season_year=${input.seasonYear}&season_quarter=${input.seasonQuarter}`;

      try {
        const initResponse = await fetch(seasonListURL, {
          headers: {
            Cookie: `authtoken_members=${ctx.iracingAuthCode}`,
          },
        });

        if (!initResponse.ok) {
          throw new Error("Failed to get initial response.");
        }

        const resJson = await initResponse.json();

        if (!resJson?.link) {
          throw new Error("Failed to get response link.");
        }

        try {
          const innerFetch = fetch(resJson?.link, {
            headers: {
              Cookie: ctx.iracingAuthCode,
            },
          });
        } catch (downloadError) {
          if (downloadError instanceof Error) return downloadError.message;
          if (typeof downloadError === "string") return downloadError;
          return "Unknown error occurred";
        }
      } catch (error) {
        if (error instanceof Error) return error.message;
        if (typeof error === "string") return error;
        return "Unknown error occurred";
      }
    }),

  getSeries: iracingProcedure.query(async ({ ctx, input }) => {}),
});
