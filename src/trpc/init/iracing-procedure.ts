import { eq, and } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { OAuth2Tokens, refreshAccessToken } from "better-auth";

import { db } from "@/db";
import { account as accountTable } from "@/db/schemas";

import { protectedProcedure } from ".";

const EXPIRY_SKEW_MS = 60_000;

export const iracingProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const account = await getUserAccount(ctx.auth.user.id);

    const isExpired =
      !!account.accessTokenExpiresAt &&
      new Date(account.accessTokenExpiresAt.getTime() - EXPIRY_SKEW_MS) <
        new Date();

    if (!isExpired) {
      return next({
        ctx: {
          ...ctx,
          iracingAccessToken: account.accessToken,
          custId: account.accountId,
        },
      });
    }

    const refreshed = await refreshAccessToken({
      refreshToken: account.refreshToken,
      options: {},
      tokenEndpoint: "https://oauth.iracing.com/oauth2/token",
    });

    await persistRefreshedTokens(account.id, refreshed);

    return next({
      ctx: {
        ...ctx,
        iracingAccessToken: refreshed.accessToken,
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

async function persistRefreshedTokens(accountId: string, token: OAuth2Tokens) {
  if (!token.accessTokenExpiresAt) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "iracing access token expiration missing",
    });
  }

  if (!token.refreshTokenExpiresAt) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "iracing refresh token expiration missing",
    });
  }

  const now = new Date();

  const accessTokenExpiresAt = new Date(
    now.getTime() + token.accessTokenExpiresAt.getTime() * 1000,
  );
  const refreshTokenExpiresAt = new Date(
    now.getTime() + token.refreshTokenExpiresAt.getTime() * 1000,
  );

  await db
    .update(accountTable)
    .set({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiresAt,
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
