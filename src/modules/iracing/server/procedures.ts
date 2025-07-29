import { eq } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { IracingLoginSchema } from "@/modules/iracing/schema";

import { hashIRacingPassword } from "@/lib/utils";
import { authenticateIRacing } from "@/lib/iracing-auth";

import { db } from "@/db";
import { user } from "@/db/schema";

export const iracingRouter = createTRPCRouter({
  login: protectedProcedure
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
        .update(user)
        .set({
          iracingCookie: result.authCookie,
        })
        .where(eq(user.id, ctx.auth.user.id));

      const [member] = await db
        .select()
        .from(user)
        .where(eq(user.id, ctx.auth.user.id));

      return member;
    }),
});
