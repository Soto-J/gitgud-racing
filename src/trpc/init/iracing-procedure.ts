import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import { protectedProcedure } from ".";

import { refreshIracingAccessToken } from "@/lib/auth/iracing-oauth-helpers";
import { TokenResponse } from "@/lib/auth/types";

const EXPIRY_SKEW_MS = 60_000;

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const account = await getUserAccount(ctx.auth.user.id);

    const isExpired =
      !!account.accessTokenExpiresAt &&
      new Date(account.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS) <
        new Date();

    if (isExpired) {
      try {
        const refreshed = await refreshIracingAccessToken(
          account?.refreshToken,
        );
        await persistRefreshedTokens(account.id, refreshed);

        return next({
          ctx: {
            ...ctx,
            iracingAccessToken: refreshed.access_token,
            custId: account.accountId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to refresh iRacing session. Please reconnect.",
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

  return account;
}

async function persistRefreshedTokens(
  accountId: string,
  tokens: TokenResponse,
) {
  const now = new Date();

  const accessTokenExpiresAt = new Date(
    now.getTime() + tokens.expires_in * 1000,
  );
  const refreshTokenExpiresAt = new Date(
    now.getTime() + tokens.refresh_token_expires_in * 1000,
  );
  await db
    .update(accountTable)
    .set({
      accessToken: tokens.access_token,
      accessTokenExpiresAt,
      refreshToken: tokens.refresh_token,
      refreshTokenExpiresAt,
    })
    .where(eq(accountTable.id, accountId));
}

// TODO
// const refreshLocks = new Map<string, Promise<IracingTokenResponse>>();

// async function refreshSingleFlight(account) {
//   if (refreshLocks.has(account.id)) {
//     return refreshLocks.get(account.id)!;
//   }

//   const promise = (async () => {
//     const refreshed = await refreshIracingAccessToken(account.refreshToken!);
//     await persistRefreshedTokens(account.id, refreshed);
//     return refreshed;
//   })();

//   refreshLocks.set(account.id, promise);

//   try {
//     return await promise;
//   } finally {
//     refreshLocks.delete(account.id);
//   }
// }
