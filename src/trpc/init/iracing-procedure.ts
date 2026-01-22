import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import { protectedProcedure } from ".";
import { refreshIracingAccessToken } from "@/lib/auth/utils/iracing-oauth-helpers";
import { mapRefreshErrorToTRPC, RefreshTokenError } from "@/trpc/errors";

const EXPIRY_SKEW_MS = 60_000;

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const { accessToken, custId } = await db.transaction(async (tx) => {
      const [account] = await tx
        .select()
        .from(accountTable)
        .for("update")
        .where(
          and(
            eq(accountTable.userId, ctx.auth.user.id),
            eq(accountTable.providerId, "iracing"),
          ),
        );

      if (!account) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No iRacing account connected",
        });
      }

      const isExpired =
        !!account.accessTokenExpiresAt &&
        new Date(account.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS) <
          new Date();

      if (!isExpired) {
        return {
          accessToken: account.accessToken!,
          custId: account.accountId!,
        };
      }

      if (!account.refreshToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "iRacing session expired. Please reconnect.",
        });
      }

      try {
        const refreshedPayload = await refreshIracingAccessToken(
          account.refreshToken,
        );

        const now = Date.now();
        const accessTokenExpiresAt = new Date(
          now + refreshedPayload.expires_in * 1000,
        );
        const refreshTokenExpiresAt = new Date(
          now + refreshedPayload.refresh_token_expires_in * 1000,
        );

        await tx
          .update(accountTable)
          .set({
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            accessToken: refreshedPayload.access_token,
            refreshToken: refreshedPayload.refresh_token,
          })
          .where(eq(accountTable.id, account.id));

        return {
          accessToken: refreshedPayload.access_token,
          custId: account.accountId!,
        };
      } catch (err) {
        if (err instanceof RefreshTokenError) {
          throw mapRefreshErrorToTRPC(err);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error refreshing iRacing session",
        });
      }
    });

    return next({
      ctx: {
        ...ctx,
        iracingAccessToken: accessToken,
        custId,
      },
    });
  },
);
