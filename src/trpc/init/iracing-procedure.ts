import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { DateTime } from "luxon";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import { protectedProcedure } from ".";

import {
  IracingTokenResponse,
  refreshIracingAccessToken,
} from "@/modules/iracing/server/api";

const EXPIRY_SKEW_MS = 60_000;

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const account = await getUserAccount(ctx.auth.user.id);

    const isExpired =
      !!account.accessTokenExpiresAt &&
      DateTime.fromMillis(
        account.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS,
      ) < DateTime.now();

    if (isExpired) {
      if (!account.refreshToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "iRacing session expired. Please re-authenticate.",
        });
      }

      let refreshed: IracingTokenResponse;

      try {
        refreshed = await refreshIracingAccessToken(account.refreshToken);
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to refresh iRacing session. Please reconnect.",
        });
      }

      await persistRefreshedTokens(account.id, refreshed);

      return next({
        ctx: {
          ...ctx,
          iracingAccessToken: refreshed.access_token,
          custId: account.accountId,
        },
      });
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

  return account;
}

async function persistRefreshedTokens(
  accountId: string,
  tokens: IracingTokenResponse,
) {
  await db
    .update(accountTable)
    .set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      accessTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(eq(accountTable.id, accountId));
}
