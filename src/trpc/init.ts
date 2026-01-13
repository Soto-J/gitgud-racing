import { cache } from "react";

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { eq, and } from "drizzle-orm";

import { getSession } from "@/lib/get-session";
import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { userId: "user_123" };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await getSession();

  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({ ctx: { ...ctx, auth: session } });
});

export const manageProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.auth.user?.role === "user" || ctx.auth.user?.role === "guest") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({ ctx });
});

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const [userAccount] = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.userId, ctx.auth.user.id),
          eq(accountTable.providerId, "iracing"),
        ),
      );

    if (!userAccount) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please connect your iRacing account to access this feature.",
      });
    }

    const isTokenExpired =
      userAccount.accessTokenExpiresAt &&
      userAccount.accessTokenExpiresAt < new Date();

    if (isTokenExpired) {
      if (!userAccount.refreshToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Your iRacing session has expired. Missing refresh token.",
        });
      }

      return next({
        ctx: {
          ...ctx,
          iracingAccessToken: userAccount.refreshToken,
        },
      });
    }

    if (!userAccount.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Missing iRacing access token. Please reconnect your account.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        iracingAccessToken: userAccount.accessToken,
      },
    });
  },
);
