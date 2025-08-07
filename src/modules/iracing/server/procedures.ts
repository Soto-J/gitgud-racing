import z from "zod";

import { eq, getTableColumns } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  iracingProcedure,
  syncIracingProfileProcedure,
} from "@/trpc/init";

import { IRACING_URL } from "@/constants";

import { db } from "@/db";
import { license, profile, user } from "@/db/schema";

import * as helper from "./helper";

/*
// "https://members-ng.iracing.com/data/member/info",

  body: {
    all: {
      link: 'https://members-ng.iracing.com/data/doc',
      note: 'Documentation for all service methods can be accessed here.'
    },
    service: {
      link: 'https://members-ng.iracing.com/data/doc/car',
      note: 'Each service has its own documentation page, like above.'
    },
    method: {
      link: 'https://members-ng.iracing.com/data/doc/car/assets',
      note: 'Each service method also has a documentation page.'
    }
  }
*/
export const iracingRouter = createTRPCRouter({
  getDocumentation: iracingProcedure.query(async ({ ctx }) => {
    try {
      console.log("Making request to:", `${IRACING_URL}/data/doc`);

      const response = await fetch(`${IRACING_URL}/doc`, {
        headers: {
          Cookie: `authtoken_members=${ctx.iracingAuthData.authCookie}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Error: Problem fetching iRacing documentation",
          data: null,
        };
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Failed to fetch documentation",
        error: error,
        data: null,
      };
    }
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
          // License fields (will be null if no license exists)
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

      const member = helper.transformMemberLicenses(result);

      return {
        isError: false,
        error: null,
        message: "User found",
        data: member,
      };
    }),
});
