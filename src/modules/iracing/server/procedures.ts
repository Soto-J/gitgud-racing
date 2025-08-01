import z from "zod";
import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { IracingLoginSchema } from "@/modules/iracing/schema";

import { hashIRacingPassword } from "@/lib/utils";
import { authenticateIRacing } from "@/lib/iracing-auth";

import { db } from "@/db";
import { profile } from "@/db/schema";

export const iracingRouter = createTRPCRouter({
  getAuthCookie: protectedProcedure
    .input(IracingLoginSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = hashIRacingPassword(input.password, input.email);
      console.log({ hashedPassword });

      const result = await authenticateIRacing(hashedPassword, input.email);

      if (!result.success || !result?.authCookie) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Authenticating iracing failed",
        });
      }

      await db
        .update(profile)
        .set({
          iracingCookie: result?.authCookie,
        })
        .where(eq(profile.userId, ctx.auth.user.id));

      const [member] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, ctx.auth.user.id));

      return member;
    }),

  testIracing: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const [userProfile] = await db
        .select()
        .from(profile)
        .where(eq(profile.userId, input.userId));

      const response = await fetch(
        // "https://members-ng.iracing.com/data/member/info",
        "https://members-ng.iracing.com/data/doc",
        {
          headers: {
            Cookie: `authtoken_members=${userProfile.iracingCookie}`,
          },
        },
      );

      const body = await response.json();
      console.log({ body });
      return body;
    }),
});
/*

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
