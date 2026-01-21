import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import type { TokenResponse } from "@/lib/auth/types";

import { protectedProcedure } from ".";
import { refreshIracingAccessToken } from "@/lib/auth/utils/iracing-oauth-helpers";
import { mapRefreshErrorToTRPC, RefreshTokenError } from "@/trpc/errors";

const EXPIRY_SKEW_MS = 60_000;

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const account = await getUserAccount(ctx.auth.user.id);

    const isExpired =
      !!account?.accessTokenExpiresAt &&
      new Date(account.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS) <
        new Date();

    if (isExpired) {
      console.warn({ isExpired });

      try {
        const refreshedPlayload = await refreshIracingAccessToken(
          account.refreshToken,
        );

        await persistRefreshedTokens(account.id, refreshedPlayload);

        return next({
          ctx: {
            ...ctx,
            iracingAccessToken: refreshedPlayload.access_token,
            custId: account.accountId,
          },
        });
      } catch (err) {
        if (err instanceof RefreshTokenError) {
          throw mapRefreshErrorToTRPC(err);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error refreshing iRacing session",
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        iracingAccessToken: account.accessToken,
        custId: account.accountId,
      },
    });
  },
);

async function getUserAccount(userId: string) {
  const [account] = await db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.userId, userId),
        eq(accountTable.providerId, "iracing"),
      ),
    );

  if (!account) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please connect your iRacing account to access this feature.",
    });
  }

  if (!account.accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing iRacing access token. Please reconnect.",
    });
  }

  if (!account.refreshToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "iRacing session expired. Please re-authenticate.",
    });
  }

  return {
    id: account.id,
    accountId: account.accountId,
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    accessTokenExpiresAt: account.accessTokenExpiresAt,
    refreshTokenExpiresAt: account.refreshTokenExpiresAt,
  };
}

async function persistRefreshedTokens(accountId: string, token: TokenResponse) {
  const now = Date.now();
  const accessTokenExpiresAt = new Date(now + token.expires_in * 1000);
  const refreshTokenExpiresAt = new Date(
    now + token.refresh_token_expires_in * 1000,
  );

  await db
    .update(accountTable)
    .set({
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
    })
    .where(eq(accountTable.id, accountId));
}
