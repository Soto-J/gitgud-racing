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
    /*
    Notes:
  "https://members-ng.iracing.com/data/member/info",

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

    console.log("Making request to:", `${IRACING_URL}/data/doc`);

    return await helper.fetchData({
      query: `/data/doc`,
      authCookie: ctx.iracingAuthData.authCookie,
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
});
